const AWS = require('aws-sdk');

AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.getAllCustomer = async (event) => {
  try {
    const params = {
      TableName: 'Customer'
    };

    const result = await dynamodb.scan(params).promise();
    const customer = result.Items;

    return {
      statusCode: 200,
      body: JSON.stringify(customer)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify('Error retrieving data: ' + error.message)
    };
  }
};
