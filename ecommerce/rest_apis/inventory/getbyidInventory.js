// handler.js

const AWS = require('aws-sdk');

// Configure the AWS SDK to use the local DynamoDB endpoint
AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'fake',
  secretAccessKey: 'fake'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.getItemById = async (event) => {
  const inventoryId = event.pathParameters.inventory_id; // Extract inventory_id from the path parameters

  const params = {
    TableName: 'inventory',
    Key: {
      'inventory_id': inventoryId
    }
  };

  try {
    const data = await dynamodb.get(params).promise();
    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify('Item not found')
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(data.Item)
    };
  } catch (error) {
    console.error('Error retrieving item:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Error retrieving item: ' + error.message)
    };
  }
};
