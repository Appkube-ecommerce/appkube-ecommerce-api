// handler.js

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure the AWS SDK to use the local DynamoDB endpoint
AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'fake',
  secretAccessKey: 'fake'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.updateQuantity = async (event) => {
    const inventory_id=event.pathParameters.inventory_id
  const requestBody = JSON.parse(event.body);
  const { updatedQuantity } = requestBody;

  const params = {
    TableName: 'inventory',
    Key: {
      'inventory_id': inventory_id
    },
    UpdateExpression: 'SET availableQuantity = :updatedQuantity',
    ExpressionAttributeValues: {
      ':updatedQuantity': updatedQuantity
    },
    ReturnValues: 'ALL_NEW' // Return the updated item
  };

  try {
    const updatedItem = await dynamodb.update(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(updatedItem.Attributes)
    };
  } catch (error) {
    console.error('Error updating quantity:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Error updating quantity: ' + error.message)
    };
  }
};
