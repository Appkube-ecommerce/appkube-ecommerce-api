'use strict';

const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

const dynamoDbConfig = {
  region: 'localhost',
  endpoint: 'http://localhost:8000'
};

// Set up local credentials
AWS.config.credentials = new AWS.SharedIniFileCredentials({
  profile: 'default' // Specify the AWS profile with local credentials
});

// Create DynamoDB service object with local configuration
const dynamoDb = new AWS.DynamoDB.DocumentClient(dynamoDbConfig);

module.exports.checkout = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { products, totalPrice, createdAt } = requestBody;
    const orderId = uuidv4();

    const params = {
      TableName: process.env.orderTable,
      Item: {
        orderId,
        products,
        totalPrice,
        createdAt,
        status: 'Pending'
      }
    };

    await dynamoDb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ orderId, totalAmount: totalPrice })
    };
  } catch (error) {
    console.error('Error during checkout:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process checkout' })
    };
  }
};

module.exports.getOrderConfirmation = async (event) => {
  try {
    const { orderId } = event.queryStringParameters;

    const params = {
      TableName: 'Orderss', // Updated table name
      Key: { orderId }
    };

    const { Item } = await dynamoDb.get(params).promise();

    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Order not found' })
      };
    }

    const confirmationCode = uuidv4().split('-')[0].toUpperCase();

    return {
      statusCode: 200,
      body: JSON.stringify({ orderId, confirmationCode })
    };
  } catch (error) {
    console.error('Error getting order confirmation:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get order confirmation' })
    };
  }
  
};

module.exports.getOrderHistory = async () => {
  try {
    const params = {
      TableName: 'Orderss' // Updated table name
    };

    const { Items } = await dynamoDb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(Items)
    };
  } catch (error) {
    console.error('Error getting order history:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get order history' })
    };
  }
};

module.exports.getOrderTracking = async (event) => {
  try {
    const { orderId } = event.pathParameters;

    const params = {
      TableName: 'Orderss', // Updated table name
      Key: { orderId }
    };

    const { Item } = await dynamoDb.get(params).promise();

    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Order not found' })
      };
    }

    const trackingInfo = {
      orderId,
      status: Item.status, // Use the status retrieved from the database
      estimatedDeliveryDate: new Date().toISOString() // Replace with your logic to calculate the estimated delivery date
    };

    return {
      statusCode: 200,
      body: JSON.stringify(trackingInfo)
    };
  } catch (error) {
    console.error('Error getting order tracking information:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get order tracking information' })
    };
  }
};
