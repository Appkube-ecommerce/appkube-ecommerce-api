const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const status_pending = 'pending';

module.exports.getOrderConfirmation = async (event) => {
  try {
    const { orderId } = event.pathParameters;

    const params = {
      TableName: 'order',
      Key: { order_Id: orderId }
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
      body: JSON.stringify({ orderId, confirmationCode, status: status_pending }) 
    };
  } catch (error) {
    console.error('Error getting order confirmation:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get order confirmation' })
    };
  }
};
