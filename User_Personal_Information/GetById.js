const AWS = require('aws-sdk');

AWS.config.update({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'fake',
    secretAccessKey: 'fake'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.GetById = async (event) => {
    try {
        // Extract the user_id from the path parameters of the event
        const user_id = event.pathParameters.user_id;

        const params = {
            TableName: 'USER', // Specify your table name
            Key: {
                user_id: user_id // Specify the key to retrieve the item by user_id
            }
        };

        // Get item from DynamoDB
        const data = await dynamodb.get(params).promise();

        // If item not found, return 404 status code
        if (!data.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Item not found' })
            };
        }

        // If item found, return 200 status code and the item
        return {
            statusCode: 200,
            body: JSON.stringify(data.Item)
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error fetching data: ' + error.message })
        };
    }
};
