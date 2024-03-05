const AWS = require('aws-sdk');

AWS.config.update({
    region: 'localhost', // Update with your region if not using local DynamoDB
    endpoint: 'http://localhost:8000',
    accessKeyId: 'fake',
    secretAccessKey: 'fake'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.OrderGetById = async (event) => {
    try {
        const order_id = event.pathParameters.order_id;

        const params = {
            TableName: 'OrderHistory',
            Key: {
                'OrderHistory_id': order_id
            }
        };

        const data = await dynamodb.get(params).promise();

        if (!data.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Item not found' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data.Item)
        };
    } catch (error) {
        console.error('Error retrieving data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error retrieving data: ' + error.message })
        };
    }
};
