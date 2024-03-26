const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.insertCustomer = async (event) => {
  const requestBody = JSON.parse(event.body);
  const { name, phone } = requestBody;

  const customerId = uuidv4();

  const params = {
    TableName: 'Customer',
    Item: {
      customerId,
      name,
      phone
    }
  };

  try {
    await dynamodb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data inserted successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error inserting data: ' + error.message })
    };
  }
};
