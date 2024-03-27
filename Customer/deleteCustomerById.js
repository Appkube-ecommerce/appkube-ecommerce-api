const AWS = require('aws-sdk');

AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.getCustomerById = async (event) => {
  const { customerId } = event.pathParameters; 

  if (!customerId) {
    return {
      statusCode: 400,
      body: JSON.stringify('Customer ID is required')
    };
  }

  const params = {
    TableName: 'Customer', 
    Key: {
      customerId: customerId 
    }
  };

  try {
    const data = await dynamodb.get(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data.Item)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify('Error getting data: ' + error.message)
    };
  }
};