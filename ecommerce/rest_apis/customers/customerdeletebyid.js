const AWS = require('aws-sdk');

AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
});
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.deleteCustomer= async (event) => {
  const { customer_Id } = event.pathParameters; 

  if (!customer_Id) {
    return {
      statusCode: 400,
      body: JSON.stringify('Customer ID is required')
    };
  }

  const params = {
    TableName: 'Customer', 
    Key: {
      customer_Id: customer_Id 
    }
  }

  try {

    await dynamodb.delete(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify('Customer deleted successfully')
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify('Error deleting customer: ' + error.message)
    };
  }
};
