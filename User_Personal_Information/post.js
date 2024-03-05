const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'fake',
    secretAccessKey: 'fake'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.post = async (event) => {
  try {
   
    const requestBody = JSON.parse(event.body);
    const { customer_email, personal_details } = requestBody;

   
    const user_id = uuidv4();

    const params = {
      TableName: 'USER', 
      Item: {
        user_id: user_id,
        customer_email: customer_email,
        personal_details: personal_details
      }
    };

    // Put item into DynamoDB
    await dynamodb.put(params).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data inserted successfully' })
    };
  } catch (error) {
    console.error('Error inserting data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error inserting data: ' + error.message })
    };
  }
};
