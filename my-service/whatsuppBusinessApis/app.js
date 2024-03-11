require('dotenv').config(); // Load environment variables from .env file
const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

const app = express();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Middleware to parse JSON requests with increased request size limit
app.use(bodyParser.json({ limit: '2mb' }));


// Route for handling GET requests to /webhooks
app.get('/webhooks', (req, res) => {
    console.log('Received GET request:', req.url);
    console.log('Request headers:', req.headers);
    console.log('Query parameters:', req.query);

    const token = process.env.APP_TOKEN;

    // Ensure that the request contains the necessary query parameters
    if (!req.query['hub.mode'] || !req.query['hub.verify_token'] || !req.query['hub.challenge']) {
        console.log('Missing required query parameters');
        return res.sendStatus(400);
    }

    // Validate the token
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === token) {
        console.log('Verification successful');
        return res.send(req.query['hub.challenge']);
    } else {
        console.log('Token verification failed');
        return res.sendStatus(403);
    }
});

// Route for handling POST requests to /webhooks
app.post('/webhooks', async (req, res) => {
    try {
        const body = req.body;
        
        // Check if the webhook is for messages
        if (body.field !== 'messages') {
            // Not from the messages webhook, so don't process
            return res.status(400).send('Invalid webhook type');
        }

        // Extract message data
        const message = body.value.messages[0];
        const senderPhoneNumber = message.from;
        const messageBody = message.text.body;

        // Process the message as needed
        console.log('Received message from:', senderPhoneNumber);
        console.log('Message:', messageBody);

        // Respond with success status
        res.status(200).send('Message processed successfully');
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Export the app for use with Serverless Offline
module.exports.handler = serverless(app);
