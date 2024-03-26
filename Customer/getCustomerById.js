const AWS = require('aws-sdk');

AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.getCustomerById = async (event) => {
  try {
    const customerId = event.pathParameters.customerId;

    const params = {
      TableName: 'Customer',
      Key: {
        customerId: customerId
      }
    };

    const data = await dynamodb.get(params).promise();

    if (!data.Item || Object.keys(data.Item).length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify('Customer not found')
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.Item)
    };
  } catch (error) {
    console.error('Error retrieving data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Error retrieving data: ' + error.message)
    };
  }
};
