// insert.js

const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'localhost', // Update with your AWS region or endpoint
  endpoint: 'http://localhost:8000' // Update with your DynamoDB endpoint
});

const insert = async (event) => {
  try {
    // Parse data from the request body
    const requestBody = JSON.parse(event.body);

    // Insert data into the DynamoDB table
    const params = {
      TableName: 'cart',
      Item: requestBody
    };
    await dynamodb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data inserted successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

module.exports = { insert };
