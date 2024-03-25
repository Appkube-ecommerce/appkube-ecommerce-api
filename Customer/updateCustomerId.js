const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.updateCustomer = async (event) => {
  try {
    const customerId = event.pathParameters.customerId; // Extract customerId from path parameters
    const requestBody = JSON.parse(event.body);
    const { name, phone } = requestBody;

    const params = {
      TableName: 'Customer',
      Key: {
        'customerId': customerId
      },
      UpdateExpression: 'SET #name = :name, #phone = :phone',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#phone': 'phone'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':phone': phone
      },
      ReturnValues: 'ALL_NEW'
    };

    const updatedCustomer = await dynamodb.update(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Customer updated successfully', updatedCustomer })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error updating customer: ' + error.message })
    };
  }
};
