const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');


AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000'
  // accessKeyId: 'fake',
  // secretAccessKey: 'fake'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.insertData = async (event) => {
  const requestBody = JSON.parse(event.body);
  const { product_id, availableQuantity } = requestBody;

  // Generate the current date and time
  const createdAt = new Date().toISOString();

  const params = {
    TableName: 'inventory', // Change the table name if needed
    Item: {
      inventory_id: uuidv4(),
      product_id,
      availableQuantity,
      createdAt
    }
  };

  try {
    await dynamodb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify('Data inserted successfully')
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify('Error inserting data: ' + error.message)
    };
  }
};
