const { DynamoDBClient, ScanCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

module.exports.deleteAllOrders = async (event) => {
    try {
        // Define the params for the Scan operation to retrieve all items
        const scanParams = {
            TableName: 'Order' // Change table name to 'Order'
        };

        // Perform the Scan operation to retrieve all items
        const data = await dynamoDB.send(new ScanCommand(scanParams));

        // Extract the order IDs from the retrieved items
        const orderIds = data.Items.map(item => item.orderId.S);

        // Delete each item by its ID
        const deletePromises = orderIds.map(orderId => {
            const params = {
                TableName: 'Order', // Change table name to 'Order'
                Key: {
                    'orderId': { S: orderId } // Change attribute name to 'orderId'
                }
            };
            return dynamoDB.send(new DeleteItemCommand(params));
        });

        // Wait for all delete operations to complete
        await Promise.all(deletePromises);

        // Return success response
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'All orders deleted successfully' }),
        };
    } catch (error) {
        console.error('Error deleting all orders:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to delete all orders', error: error.message }),
        };
    }
};
