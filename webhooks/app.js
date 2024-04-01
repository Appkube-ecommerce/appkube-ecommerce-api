const https = require("https");
const { sendCatalogMessage } = require("./sendCatalog");
const { getUserAddress,storeUserResponse, sendPaymentLinkButton } = require("./test2");
//const { getUserAddressFromDatabase, checkUserExists,autofillUserAddressForm, logUserAddress}= require('./test2');
const { getUserAddressFromDatabase, sendAddressMessageWithSavedAddresses } = require("./test3");
const { client, connectToDatabase } = require("./conn");
//const createPaymentLink = require("./razorPay");
 
client.connect();
 
// Import the getSession and updateSession functions
async function getSession(senderId) {
    try {
        const result = await client.query('SELECT * FROM sessions WHERE sender_id = $1', [senderId]);
 
        if (result.rows.length > 0) {
            return result.rows[0].session_data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting session from PostgreSQL:', error);
        throw error;
    }
}
 
// Define a function to update or create a session
async function updateSession(senderId, session) {
    try {
        const result = await client.query(
            'INSERT INTO sessions(sender_id, session_data) VALUES ($1, $2) ON CONFLICT(sender_id) DO UPDATE SET session_data = $2 RETURNING *',
            [senderId, session]
        );
 
        return result.rows[0].session_data;
    } catch (error) {
        console.error('Error updating session in PostgreSQL:', error);
        throw error;
    }
}
 
// Define the sendReply function
async function sendReply(phone_number_id, whatsapp_token, to, reply_message) {
    try {
        const json = {
            messaging_product: "whatsapp",
            to: to,
            text: { body: reply_message },
        };
 
        const data = JSON.stringify(json);
        const path = `/v18.0/${phone_number_id}/messages`;
 
        const options = {
            host: "graph.facebook.com",
            path: path,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + whatsapp_token
            }
        };
 
        // Use a promise to handle the http request
        const response = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let str = "";
                res.on("data", (chunk) => {
                    str += chunk;
                });
                res.on("end", () => {
                    resolve(str);
                });
            });
 
            req.on("error", (e) => {
                reject(e);
            });
 
            req.write(data);
            req.end();
        });
 
        // You can handle the response here if needed
 
        return response;
    } catch (error) {
        console.error('Error in sendReply:', error);
        throw error;
    }
}
 

            exports.handler = async (event) => {
               // console.log('Received event:', JSON.stringify(event));
            
                try {
                    if (!event || !event.requestContext || !event.requestContext.http || !event.requestContext.http.method || !event.requestContext.http.path) {
                        console.error('Invalid event:', event);
                        return {
                            statusCode: 400,
                            body: JSON.stringify({ error: 'Invalid event' }),
                        };
                    }
            
                    console.log('Received HTTP method:', event.requestContext.http.method);
            
                    const WHATSAPP_TOKEN = process.env.whatsapp_Token;
            
                    if (event.requestContext.http.method === "GET") {
                        const queryParams = event.queryStringParameters;
                        if (queryParams) {
                            const mode = queryParams["hub.mode"];
                            const verifyToken = queryParams["hub.verify_token"];
                            const challenge = queryParams["hub.challenge"];
            
                            if (mode === "subscribe" && verifyToken === process.env.VERIFY_TOKEN) {
                                return {
                                    statusCode: 200,
                                    body: challenge,
                                    isBase64Encoded: false
                                };
                            } else {
                                const responseBody = "Error, wrong validation token";
                                return {
                                    statusCode: 403,
                                    body: JSON.stringify(responseBody),
                                    isBase64Encoded: false
                                };
                            }
                        } else {
                            const responseBody = "Error, no query parameters";
                            return {
                                statusCode: 403,
                                body: JSON.stringify(responseBody),
                                isBase64Encoded: false
                            };
                        }
                    } else if (event.requestContext.http.method === 'POST') {
                        const body = JSON.parse(event.body);
                    
                        if (body && body.entry) {
                            for (const entry of body.entry) {
                                for (const change of entry.changes) {
                                    const value = change.value;
                    
                                    if (value != null && value.messages != null) {
                                        const phone_number_id = value.metadata.phone_number_id;
                                        console.log('@@' + value + "dm");
                                        for (const message of value.messages) {
                                            const senderId = message.from;
                    
                                            let session = await getSession(senderId);
                                            if (!session) {
                                                session = {};
                                            }
                    
                                            switch (message.type) {
                                                case 'text':
                                                    if (session && session.cart && session.cart.items && session.cart.items.length > 0) {
                                                        const incompleteOrder = session.cart.items;
                                                        console.log('Incomplete order found:', incompleteOrder);
                                                        const incompleteOrderMessage = 'Your previous order is incomplete. Please complete your order or start a new one.';
                                                        await sendReply(phone_number_id, WHATSAPP_TOKEN, senderId, incompleteOrderMessage);
                                                        session.cart = {};
                                                        session = await updateSession(senderId, session);
                                                        return {
                                                            statusCode: 200,
                                                            body: JSON.stringify({ message: 'Done' }),
                                                            isBase64Encoded: false,
                                                        };
                                                    }
                    
                                                    const reply_message = 'Welcome TO Farms';
                                                    await sendReply(phone_number_id, WHATSAPP_TOKEN, senderId, reply_message);
                                                    await sendCatalogMessage(senderId, WHATSAPP_TOKEN);
                                                    break;
                    
                                                    case 'order':
                                                        const message_order = message.order.product_items;
                 
                                                        // Process the order details and update the session
                                                        const cartItems = message_order.map(item => ({
                                                            productId: item.product_retailer_id,
                                                            quantity: item.quantity,
                                                            price: item.item_price,
                                                            // Add other details as needed
                                                        }));
                 
                                                        // Save the updated session
                
                                                        
                                                        session.cart = {
                                                            items: cartItems,
                                                        };
                 
                    
                                                    session = await updateSession(senderId, session);
                                                    //await getUserAddress(senderId, WHATSAPP_TOKEN);
                                                    const userDetails = await getUserAddressFromDatabase(senderId);
                                                        console.log('====================================');
                                                        console.log(userDetails);
                                                        console.log('====================================');
                                                    await sendAddressMessageWithSavedAddresses(senderId,WHATSAPP_TOKEN,userDetails);
                                                            //console.log('@@@@@@'+sendAddressMessageWithSavedAddresses()+'#####');
            
                                                    break;
                    
                                                case 'interactive':
                                                    if (message.interactive.type === 'nfm_reply') {
                                                        const responseJson = JSON.parse(message.interactive.nfm_reply.response_json);
                                                        await storeUserResponse(senderId, responseJson);
                                                        const orders = session.cart.items;
                                                
                                            // Calculate total price based on the extracted orders
                                            const totalPrice = orders.reduce((acc, item) => {
                                                const itemTotal = item.quantity * item.price;
                                                return acc + itemTotal;
                                            }, 0);
 
                                            let paymentLink = await createPaymentLink.createPaymentLink(1)
                                            sendPaymentLinkButton(senderId, WHATSAPP_TOKEN, paymentLink.short_url)
 
                                            // Save the updated session
                                            session = await updateSession(senderId, session);
 
                                   
                                        }
                                                    break;
                    
                                                default:
                                                    break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    
                        return {
                            statusCode: 200,
                            body: JSON.stringify({ message: 'Done' }),
                            isBase64Encoded: false,
                        };
                    } else {
                        const responseBody = 'Unsupported method';
                        return {
                            statusCode: 403,
                            body: JSON.stringify(responseBody),
                            isBase64Encoded: false,
                        };
                    }
                    } catch (error) {
                    console.error('Error in handler:', error);
                    return {
                        statusCode: 500,
                        body: JSON.stringify({ error: 'Internal Server Error' }),
                        isBase64Encoded: false,
                    };
                    }
                    };