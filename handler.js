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
        return res.status(400).send('Missing required query parameters');
    }

    // Validate the token
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === token) {
        console.log('Verification successful');
        return res.status(200).send(req.query['hub.challenge']);
    } else {
        console.log('Token verification failed');
        return res.status(403).send('Token verification failed'); // Forbidden
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports.handler = serverless(app);



const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'localhost', endpoint: 'http://localhost:8000' }); // Assuming DynamoDB Local is running on default port 8000

app.post('/webhooks', (req, res) => {
  const body = req.body; // No need to parse JSON if using DynamoDB Local

  if (body.field !== 'messages') {
    // Not from the messages webhook so don't process
    return res.sendStatus(400);
  }

  const reviews = body.value.messages.map((message) => {
    const reviewInfo = {
      TableName: process.env.REVIEW_TABLE,
      Item: {
        phonenumber: message.from,
        review: message.text.body
      }
    };
    return dynamoDb.put(reviewInfo).promise();
  });

  // Return 200 code once all reviews have been written to DynamoDB
  return Promise.all(reviews)
    .then((data) => res.sendStatus(200))
    .catch((err) => {
      console.error('Error writing reviews to DynamoDB:', err);
      return res.sendStatus(500);
    });
});

module.exports.webhooks = serverless(app);
