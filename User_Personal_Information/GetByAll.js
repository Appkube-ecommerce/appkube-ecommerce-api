const AWS = require('aws-sdk');

AWS.config.update({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'fake',
    secretAccessKey: 'fake'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.GetByAll = async (event) => {
    try {
        const params = {
            TableName: 'USER' // Specify your table name
        };

        // Fetch all items from DynamoDB
        const data = await dynamodb.scan(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify(data.Items)
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error fetching data: ' + error.message })
        };
    }
};
