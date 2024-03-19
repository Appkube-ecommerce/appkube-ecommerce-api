const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'localhost', // Update with your AWS region or endpoint
  endpoint: 'http://localhost:8000' // Update with your DynamoDB endpoint
});

const search = async () => {
  try {
    console.log('Starting search function...');

    const params = {
      TableName: 'cart'
    };

    console.log('Scanning DynamoDB table...');
    const data = await dynamodb.scan(params).promise();

    console.log('Search successful. Returning data.');
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items)
    };
  } catch (error) {
    console.error('Error during search:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not get data from DynamoDB' })
    };
  }
};

module.exports = { search };
