require('dotenv').config(); // Load environment variables from .env file
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.insertCustomer = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { name, phone } = requestBody;

    const customerId = uuidv4();

    // Fetch the table name from the environment variable
    const tableName = process.env.DYNAMODB_TABLE_NAME;

    const params = {
      TableName: tableName,
      Item: {
        id: customerId,
        name,
        phone,
        // Add additional attributes according to the desired output format
        __typename: 'Customer', // Add __typename attribute
        _lastChangedAt: Date.now(), // Add _lastChangedAt attribute
        _version: 1, // Add _version attribute
        updatedAt: new Date().toISOString(), // Add updatedAt attribute
        createdAt: new Date().toISOString() // Add createdAt attribute
      }
    };

    await dynamodb.put(params).promise();
    // Return the inserted item in the desired format
    return {
      statusCode: 200,
      body: JSON.stringify(params.Item)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error inserting data: ' + error.message })
    };
  }
};
