const AWS = require('aws-sdk');

AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.updateCustomer = async (event) => {
  try {
    const { customer_Id } = event.pathParameters;  
    const requestBody = JSON.parse(event.body);
    const { customer_details } = requestBody;

    const params = {
      TableName: 'Customer',  
      Key: {
        customer_Id: customer_Id  
      },
      UpdateExpression: 'SET customer_details = :details', 
      ExpressionAttributeValues: { ':details': customer_details }, 
      ReturnValues: 'ALL_NEW' 
    };

    const updatedItem = await dynamodb.update(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data updated successfully', updatedItem })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify('Error updating data: ' + error.message)
    };
  }
};
