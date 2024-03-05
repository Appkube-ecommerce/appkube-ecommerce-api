const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'fake',
    secretAccessKey: 'fake'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();


module.exports.UpdateById = async (event) => {
    try {
       
        const requestBody = JSON.parse(event.body);
        const { customer_email, personal_details } = requestBody;
        const user_id  = event.pathParameters.user_id;

   
        const params = {
            TableName: 'USER',
            Key: {
                user_id: user_id
            },
            UpdateExpression: 'set customer_email = :ce, personal_details = :pd',
            ExpressionAttributeValues: {
                ':ce': customer_email,
                ':pd': personal_details
            },
            ReturnValues: 'ALL_NEW' 
        };

        const updatedItem = await dynamodb.update(params).promise();
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data updated successfully', updatedItem })
        };
    } catch (error) {
        console.error('Error updating data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error updating data: ' + error.message })
        };
    }
};
