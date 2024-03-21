require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Endpoint to receive incoming messages from WhatsApp
app.post('/what/webhooks', async (req, res) => {
    try {
        const incomingMessage = req.body;
        console.log('Incoming message:', incomingMessage);

        // Extract the user's response from the incoming message
        const userResponse = incomingMessage.text.body; // Assuming the user's response is in the 'text' field

        // You can optionally perform validation or processing on the user's response here

        // Respond with a success status
        res.status(200).send('Message received successfully.');

        // Return the user's response
        return userResponse;
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).send('Error handling webhook.');
    }
});

// Function to send a message via WhatsApp
async function sendMessage(toPhoneNumber, accessToken, url, message) {
    try {
        const messageData = {
            messaging_product: 'whatsapp',
            to: toPhoneNumber,
            type: 'text',
            text: {
                body: message
            }
        };

        const response = await axios.post(url, messageData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Message sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending message:', error.response.data.error);
    }
}

// Function to request address from user
async function requestAddress(toPhoneNumber, accessToken, url) {
    try {
        // Send initial message asking for the address
        const message = "Hi there! Please provide your address. Start with the street name:";
        await sendMessage(toPhoneNumber, process.env.whatsapp_Token, url, message);
        
        // Wait for the user's response for the street
        const street = await getUserResponse();
        console.log("User provided street:", street);

        // Construct messageData object with user-provided address
        const messageData = {
            messaging_product: 'whatsapp',
            to: toPhoneNumber,
            type: 'contacts',
            contacts: [
                {
                    name: {
                        formatted_name: 'John Doe',
                        first_name: 'John'
                    },
                    addresses: [
                        {
                            street: street,
                            city: 'CITY',
                            state: 'STATE',
                            zip: 'ZIP',
                            country: 'COUNTRY',
                            country_code: 'COUNTRY_CODE',
                            type: 'HOME'
                        }
                    ]
                }
            ]
        };

        // Set the correct URL for sending messages
        const sendMessageUrl = `https://graph.facebook.com/v19.0/${toPhoneNumber}/messages`;

        // Send the messageData object to your API endpoint
        const response = await axios.post(sendMessageUrl, messageData, {
            headers: {
                Authorization: `Bearer ${process.env.whatsapp_Token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Contact message sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending contact message:', error.response.data.error);
    }
}

// Dummy function to simulate receiving user's response
async function getUserResponse() {
    // For demonstration purposes, let's assume the user's response is hardcoded
    return "User's response";
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = { requestAddress };
