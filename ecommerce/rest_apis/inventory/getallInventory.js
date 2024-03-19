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

module.exports.getAllData = async (event) => {
  
  const params = {
    TableName: 'inventory'
  };

  try {
    const data = await dynamodb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify('Error getting data: ' + error.message)
    };
  }
};
