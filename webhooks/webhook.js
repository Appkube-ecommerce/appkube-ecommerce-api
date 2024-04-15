const https = require("https");
const { sendCatalogMessage } = require("./sendCatalog");
const { getUserAddressFromDatabase, sendAddressMessageWithSavedAddresses, storeUserResponse } = require("./getAddress");
const { client, connectToDatabase } = require("./db");
const { setIncompleteOrderAlertSent, getIncompleteOrderAlertSent,getPreviousIncompleteOrder} = require('./alertOrder')
const { sendButtons} = require('./merge');

//const createPaymentLink = require("./razorPay");
 
client.connect();
 
// Import the getSession and updateSession functions
async function getSession(senderId) {
    try {
        const result = await client.query('SELECT * FROM sessions WHERE sender_id = $1', [senderId]);

        if (result.rows.length > 0) {
            return result.rows[0].session_data;
        } else {
            // Initialize session object with incompleteOrderAlertSent set to false for new users
            return { incompleteOrderAlertSent: false };
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
                                            console.log('====================================');
                                            console.log(message);
                                            console.log('====================================');
                                            let session = await getSession(senderId);
                                            if (!session) {
                                                session = {};
                                            }
                                            
                                            let incompleteOrderAlertSent = await getIncompleteOrderAlertSent(senderId);

                                            switch (message.type) {
                                                case 'text':
                                                    console.log('Received text message');
                                                    // Send catalog options first
                                                    const reply_message = 'Welcome TO Synectiks_Farms';
                                                    await sendReply(phone_number_id, WHATSAPP_TOKEN, senderId, reply_message);
                                                    await sendCatalogMessage(senderId, WHATSAPP_TOKEN);
                                                    break;
                                        
                                            
                                                    case 'order':
    // Handle order messages
    // Process the order details and update the session
                                                const messageOrder = message.order.product_items;
                                                const newCartItems = messageOrder.map(item => ({
                                                    productId: item.product_retailer_id,
                                                    quantity: item.quantity,
                                                    price: item.item_price,
                                                    // Add other details as needed
                                                }));

                                                // Check if the session has existing cart items
                                                if (!session.cart || !session.cart.items) {
                                                    // If no existing cart items, initialize the cart with the new items
                                                    session.cart = { items: newCartItems };
                                                } else {
                                                    // If existing cart items, append the new items to the existing list
                                                    session.cart.items.push(...newCartItems);
                                                }

                                                // Save the updated session
                                                session = await updateSession(senderId, session);
                
                                                        // Check if there is an incomplete order after a delay
                                                        setTimeout(async () => {
                                                            const previousOrder = await getPreviousIncompleteOrder(senderId);
                
                                                            if (session && session.cart && session.cart.items && session.cart.items.length > 0 && incompleteOrderAlertSent) {
                                                                // Handle incomplete order
                                                                const incompleteOrderTotal = calculateTotalAmount(previousOrder.cart);
                                                                const incompleteOrderMessage = `Your previous order is incomplete. Total amount: ${incompleteOrderTotal}. Please choose an option:`;
                
                                                                // Define the options with merge and continue buttons
                                                                const options = {
                                                                    messaging_product: "whatsapp",
                                                                    recipient_type: "individual",
                                                                    to: senderId,
                                                                    type: "interactive",
                                                                    interactive: {
                                                                        type: "button",
                                                                        body: {
                                                                            text: incompleteOrderMessage
                                                                        },
                                                                        action: {
                                                                            buttons: [
                                                                                {
                                                                                    type: "reply",
                                                                                    reply: {
                                                                                        id: "merge_button",
                                                                                        title: "Merge Order"
                                                                                    }
                                                                                },
                                                                                {
                                                                                    type: "reply",
                                                                                    reply: {
                                                                                        id: "continue_button",
                                                                                        title: "Continue Order"
                                                                                    }
                                                                                }
                                                                            ]
                                                                        }
                                                                    }
                                                                };
                
                                                                await sendButtons(WHATSAPP_TOKEN, options);
                
                                                                // Set the incomplete order alert flag to true
                                                                await setIncompleteOrderAlertSent(senderId, true);
                                                            } else {
                                                                // If there is no incomplete order, send the address directly
                                                                const userDetails = await getUserAddressFromDatabase(senderId);
                                                                await sendAddressMessageWithSavedAddresses(senderId, WHATSAPP_TOKEN, userDetails);
                                                            }
                                                        }, 1000); // 1 second delay
                                                        break;
                                            
                                                case 'catalog_sent':
                                                    // Handle catalog sent message
                                                    // Add your logic here to process the catalog sent message
                                                    console.log('Catalog sent:', message);
                                                    // Example: You can trigger some action after the catalog is sent
                                                    break;
                                            
                                                    case 'interactive':
                                                            if (message.interactive.type === 'nfm_reply') {
                                                                // Process the interactive message
                                                                // Reset the incomplete order flag when the order is completed
                                                                incompleteOrderAlertSent = false;
                                                                // Continue with regular processing
                                                                const responseJson = JSON.parse(message.interactive.nfm_reply.response_json);
                                                                await storeUserResponse(senderId, responseJson);
                                                                const orders = session.cart.items;
                                                                // Calculate total price based on the extracted orders
                                                                const totalPrice = calculateTotalPrice(orders);
                                                                let paymentLink = await createPaymentLink.createPaymentLink(totalPrice);
                                                                sendPaymentLinkButton(senderId, WHATSAPP_TOKEN, paymentLink.short_url);
                                                                // Save the updated session
                                                                session = await updateSession(senderId, session);
                                                                // Reset the incomplete order flag when the order is completed
                                                                incompleteOrderAlertSent = false;
                                                                // Update the flag in the database
                                                                await setIncompleteOrderAlertSent(senderId, false);
                                                            } else if (message.interactive.type === 'button_reply') {
                                                                // Handle button reply
                                                                const buttonReplyId = message.interactive.button_reply.id;
                                                                switch (buttonReplyId) {
                                                                    case 'merge_button':
                                                                        // Handle merge button action
                                                                        const previousOrder = await getPreviousIncompleteOrder(senderId);
                                                                        if (previousOrder && previousOrder.flag && session && session.incompleteOrderAlertSent) {
                                                                            session.cart = mergeCarts(session.cart, previousOrder.cart);
                                                                            incompleteOrderAlertSent = false; // Reset the incomplete order flag
                                                                            // Update the session and set the incomplete order alert flag
                                                                            session = await updateSession(senderId, session);
                                                                            await setIncompleteOrderAlertSent(senderId, false);
                                                                        } else {
                                                                            // Handle the case when previous order doesn't exist or conditions are not met
                                                                            console.error('Previous order not found or conditions not met');
                                                                        }
                                                                        break;
                                                                        case 'continue_button':
                                                                            // Handle continue button action
                                                                            // Reset the incomplete order flag
                                                                            incompleteOrderAlertSent = false;
                                                                            // Update the session to clear incomplete order flag and keep existing cart items
                                                                            session.incompleteOrderAlertSent = false;
                                                                            // Save the updated session
                                                                            session = await updateSession(senderId, session);
                                                                            // Update the incomplete order alert flag in the database
                                                                            await setIncompleteOrderAlertSent(senderId, false);
                                                                            break;
                                                                        
                                                                    default:
                                                                        // Handle unknown button actions
                                                                        console.error('Unknown button action:', buttonReplyId);
                                                                        break;
                                                                }
                                                                // After handling the button response, send the address button
                                                                const userDetails = await getUserAddressFromDatabase(senderId);
                                                                await sendAddressMessageWithSavedAddresses(senderId, WHATSAPP_TOKEN, userDetails);
                                                            }
                                                            break;


                                                        default:
                                                            // Handle unknown message types gracefully
                                                            console.error('Unknown message type:', message.type);
                                                            break;
                                                                                                    }

                                                        // After handling the button response, send the address button
                                                                               
                                            
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
                                            

                    function calculateTotalAmount(cartItems) {
                        let totalAmount = 0;
                        for (const item of cartItems) {
                            totalAmount += item.quantity * item.price;
                        }
                        return totalAmount;
                    }
                    // Example implementation of processOrderItems function

// Example implementation of calculateTotalPrice function
function calculateTotalPrice(orders) {
    // Check if orders is null or undefined
    if (!orders) {
        console.error('Orders is null or undefined');
        return 0; // Return 0 if orders is null or undefined
    }

    // Check if orders is iterable
    if (typeof orders[Symbol.iterator] !== 'function') {
        console.error('Orders is not iterable');
        return 0; // Return 0 if orders is not iterable
    }

    // Initialize total price
    let totalPrice = 0;

    // Loop through each order and accumulate the total price
    for (const order of orders) {
        totalPrice += order.price * order.quantity;
    }

    return totalPrice;
}

function mergeCarts(currentCart, previousOrderCart) {
    // Check if previousOrderCart.items is an array
    if (!Array.isArray(previousOrderCart.items)) {
        previousOrderCart.items = [];
    }
    // Merge the current cart items with the previous incomplete order cart items
    const mergedItems = [...currentCart.items, ...previousOrderCart.items];
    // Return the merged cart object
    return { items: mergedItems };
}
