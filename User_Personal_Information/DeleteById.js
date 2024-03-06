const AWS = require('aws-sdk');

AWS.config.update({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'fake',
    secretAccessKey: 'fake'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.DeleteById = async (event) => {
    try {
  
        const user_id = event.pathParameters.user_id;

        const params = {
            TableName: 'USER', 
            Key: {
                user_id: user_id 
            }
        };

        await dynamodb.delete(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Item deleted successfully' })
        };
    } catch (error) {
        console.error('Error deleting data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error deleting data: ' + error.message })
        };
    }
};
