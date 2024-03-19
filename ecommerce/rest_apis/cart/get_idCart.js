// handler.js

const AWS = require('aws-sdk');

// Configure the AWS SDK to use the local DynamoDB endpoint
AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.getItemById = async (event) => {
  const itemid = event.pathParameters.itemid; 
console.log(itemid)
  const params = {
    TableName: 'cart',
    Key: {
      'itemId': itemid
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

/*const AWS = require('aws-sdk');

// Set up DynamoDB DocumentClient
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'localhost', // Update with your AWS region or endpoint
  endpoint: 'http://localhost:8000' // Update with your DynamoDB endpoint
});

// Function to retrieve an item from DynamoDB based on itemId
async function getItemById(event) {
  const itemid=event.pathParameters.itemid
  try {
    console.log('Starting getItemById function...');

    const params = {
      TableName: 'cart',
      KeyConditionExpression: 'itemId = :itemId',
      ExpressionAttributeValues: {
        ':itemId': itemId
      }
    };

    console.log('Querying DynamoDB table...');
    const data = await dynamodb.query(params).promise();

    console.log('Query successful. Returning data.');
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items)
    };
  } catch (error) {
    console.error('Error during getItemById:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not get data from DynamoDB' })
    };
  }
}

// Export the getItemById function
module.exports = { getItemById };*/
