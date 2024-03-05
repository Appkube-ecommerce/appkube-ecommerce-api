const AWS = require('aws-sdk');

AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.getOrderHistory = async () => {
    try {
      const params = {
        TableName: 'order' // Updated table name
      };
   
      const { Items } = await dynamodb.scan(params).promise();
   
      return {
        statusCode: 200,
        body: JSON.stringify(Items)
      };
    } catch (error) {
      console.error('Error getting order history:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to get order history' })
      };
    }
  };
