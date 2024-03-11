require('dotenv').config(); // Load environment variables from .env file
const serverless = require('serverless-http');
const express = require('express');
const app = express();

app.use(express.json()); // Add middleware to parse JSON requests

app.get('/webhooks', (req, res) => {
    console.log('Received request:', req.url);
    console.log('Request headers:', req.headers);
    console.log('Query parameters:', req.query); // Correctly access query parameters
    console.log('Request body:', req.body);

    const token = process.env.APP_TOKEN; // Access token from environment variables

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
        return res.sendStatus(403); // Forbidden
    }
});



module.exports.handler = serverless(app);
