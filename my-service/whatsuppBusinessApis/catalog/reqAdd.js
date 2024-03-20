const axios = require('axios');

async function requestAddress(senderId, phone_number_id, WHATSAPP_TOKEN, userResponse) {
    try {
        const requiredFields = ['street', 'city', 'pincode', 'country', 'house_number'];
        const missingFields = requiredFields.filter(field => !userResponse || !userResponse[field]);

        if (missingFields.length === 0) {
            // If all required fields are provided, proceed normally
            const message = "Thank you for providing your complete address. We'll process your request shortly.";
            await sendReply(phone_number_id, WHATSAPP_TOKEN, senderId, message);
            console.log("Complete address received from:", senderId);
        } else {
            // If any required fields are missing, prompt the user to provide them
            const missingFieldsMessage = `Please provide the following missing fields: ${missingFields.join(', ')}.`;
            await sendReply(phone_number_id, WHATSAPP_TOKEN, senderId, missingFieldsMessage);
            console.log("Incomplete address received from:", senderId);
        }
    } catch (error) {
        console.error('Error handling address request:', error);
        throw error;
    }
}

async function sendReply(phone_number_id, WHATSAPP_TOKEN, senderId, message) {
    try {
        const axiosConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`
            }
        };

        const payload = {
            messaging_product: 'whatsapp',
            to: phone_number_id,
            type: 'text',
            text: { // Change the text parameter to a JSON object
                body: message // Set the body of the text as the message
            }
        };

        const response = await axios.post(
            'https://graph.facebook.com/v19.0//messages',
            payload,
            axiosConfig
        );

        console.log('Message sent:', response.data);
    } catch (error) {
        console.error('Error sending message:', error.response.data);
        throw error;
    }
}


// The provided request
const request = {
    "messaging_product": "whatsapp",
    "to": "+918867830256",
    "type": "interactive",
    "interactive": {
        "type": "BUTTON",
        "body": {
            "text": "Thank you for your order! Please provide your delivery address."
        },
        "action": {
            "buttons": [{
                "type": "reply",
                "reply": {
                    "id": "address_button",
                    "title": "Enter Address"
                }
            }]
        }
    }
};

// Extracting necessary information from the request
const senderId = request.to;
const phone_number_id = request.to;
const userResponse = null; // Assuming no user response for now
const WHATSAPP_TOKEN = ''; // Replace with your WhatsApp token

// Calling requestAddress function
requestAddress(senderId, phone_number_id, WHATSAPP_TOKEN, userResponse);
