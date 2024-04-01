const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

// Create DynamoDB client
const dynamoDB = new DynamoDBClient({
});

// Handler function to retrieve all orders
exports.getAllOrders = async () => {
    try {
        // Scan the DynamoDB table to retrieve all orders
        const scanParams = {
            TableName: process.env.ORDER_TABLE_NAME // Access table name from environment variable
        };
        const data = await dynamoDB.send(new ScanCommand(scanParams));
        
        // Return the list of orders
        return {
            statusCode: 200,
            body: JSON.stringify(data.Items)
        };
    } catch (error) {
        console.error('Error retrieving orders:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to retrieve orders', error: error.message })
        };
    }
};
