const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Webhook endpoint to receive incoming alerts
app.post('/webhooks/account-alerts', async (req, res) => {
  try {
    // Parse incoming webhook payload
    const { phoneNumber, message } = req.body;

    // Construct notification message
    const notificationMessage = `Alert: ${message}`;

    // Send notification
    await sendNotification(phoneNumber, notificationMessage);

    // Respond with success status
    res.status(200).json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    // Log and respond with error status
    console.error('Error sending notification:', error);
    res.status(500).json({ success: false, message: 'Error sending notification' });
  }
});

// Function to send notification to user

async function sendNotification(phoneNumber, message) {
  try {
    // Set up Meta API endpoint and headers
    const metaApiUrl = 'https://graph.facebook.com/v18.0/205920032613965';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer'+ process.env.META_ACCESS_TOKEN // Replace with your Meta access token
    };

    // Create message payload
    const payload = {
      messaging_type: 'RESPONSE',
      recipient: {
        phone_number: phoneNumber
      },
      message: {
        text: message
      },
      messaging_product: 'whatsapp'
    };

    // Send message using Meta API
    const response = await axios.post(metaApiUrl, payload, { headers });

    console.log('Notification sent successfully:', response.data);
    return response.data; // Return the response from the Meta API
  } catch (error) {
    console.error('Error sending notification:', error.response ? error.response.data : error.message);
    throw error; // Throw the error for handling in the calling function
  }
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports.handler = (app);