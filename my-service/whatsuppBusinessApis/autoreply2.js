const axios = require('axios');

async function handleIncomingMessage(phone_number_id, whatsapp_token, from, message) {
    try {
        // Check if the message is not from your own WhatsApp number to prevent infinite loops
        if (from !== phone_number_id) {
            let replyMessage = '';

            // Auto-reply logic based on the received text
            switch (message.toLowerCase()) {
                case 'hello':
                    replyMessage = 'Hi there!';
                    break;
                case 'how are you?':
                    replyMessage = 'I am fine, thank you!';
                    break;
                // Add more cases for different text messages and their respective replies
                default:
                    // Default reply for unrecognized messages
                    replyMessage = 'I did not understand that. Please try again.';
                    break;
            }

            // Sending the reply message
            if (replyMessage) {
                await sendReply(phone_number_id, whatsapp_token, from, replyMessage);
            }
        }
    } catch (error) {
        console.error('Error handling incoming message:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function sendReply(phone_number_id, whatsapp_token, to, replyMessage) {
    try {
        const json = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to,
            type: "text",
            text: { // Wrap the reply message in a JSON object
                body: replyMessage // Assign the reply message to the "body" field
            }
        };

        const options = {
            headers: {
                "Authorization": "Bearer " + whatsapp_token,
                "Content-Type": "application/json"
            }
        };

        const response = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, json, options);

        console.log('Reply message sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending reply message:', error.response ? error.response.data : error.message);
        throw error;
    }
}



// Example webhook endpoint to handle incoming messages
// Replace this with your actual webhook endpoint in your server setup
// This is just a placeholder for demonstration purposes
async function webhookHandler(req, res) {
    const { phone_number_id, whatsapp_token } = req.body; // Get phone number ID and WhatsApp token from request body
    const { from, message } = req.body; // Get sender's phone number and message from request body

    try {
        await handleIncomingMessage(phone_number_id, whatsapp_token, from, message);
        res.status(200).send('Message handled successfully.');
    } catch (error) {
        console.error('Error handling webhook request:', error);
        res.status(500).send('Internal server error.');
    }
}

// Example usage of webhookHandler with Express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/what/webhooks', webhookHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Export the webhookHandler function
module.exports = { webhookHandler };
