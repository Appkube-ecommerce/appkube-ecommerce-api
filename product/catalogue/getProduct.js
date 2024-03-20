'use strict';

const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1', // Set your AWS region
   endpoint: 'http://localhost:8000' // Use this for local testing with DynamoDB Local
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.getAllProducts = async (event) => {
  try {
    const params = {
      TableName: 'Products', // Replace with your DynamoDB table name
    };

    const data = await dynamoDB.scan(params).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch products' }),
    };
  }
};
