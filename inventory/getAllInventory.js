const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

module.exports.getAllInventory = async () => {
    try {
        // Define the ScanCommand to scan the entire table
        const command = new ScanCommand({
            TableName: 'Inventory-hxojpgz675cmbad5uyoeynwh54-dev'
        });

        // Perform the ScanCommand to get all inventory items
        const data = await dynamoDB.send(command);

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
