const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

module.exports.getAllInventory = async (event) => {
    try {
        // Define the params for the Scan operation
        const params = {
            TableName: 'Inventory'
        };

        // Perform the Scan operation to get all inventory items
        const data = await dynamoDB.send(new ScanCommand(params));

        // Return the list of inventory items
        return {
            statusCode: 200,
            body: JSON.stringify(data.Items),
        };
    } catch (error) {
        console.error('Error getting all inventory items:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to get all inventory items', error: error.message }),
        };
    }
};
