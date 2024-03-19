

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure the AWS SDK to use the local DynamoDB endpoint
AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.updateQuantity = async (event) => {
  const itemid = event.pathParameters.itemid; 
  const requestBody = JSON.parse(event.body);
  const { quantity } = requestBody;

  const params = {
   TableName: 'cart',
    Key: {
      'itemId': itemid
    },
    UpdateExpression: 'SET quantity = :quantity',
    ExpressionAttributeValues: {
      ':quantity': quantity
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