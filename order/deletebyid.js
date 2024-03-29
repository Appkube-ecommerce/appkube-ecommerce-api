const { DynamoDBClient, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

module.exports.deleteByOrderId = async (event) => {
    try {
        // Extract orderId from path parameters
        const orderId = event.pathParameters.OrderId;

        // Define parameters for the deleteItem operation
        const deleteParams = {
            TableName: 'Order-hxojpgz675cmbad5uyoeynwh54-dev',
            Key: {
                'OrderId': { S: orderId }
            }
        };

        // Perform the deleteItem operation to delete the specific order
        await dynamoDB.send(new DeleteItemCommand(deleteParams));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Order deleted successfully' }),
        };
    } catch (error) {
        console.error('Error deleting order by ID:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to delete order by ID', error: error.message }),
        };
    }
};