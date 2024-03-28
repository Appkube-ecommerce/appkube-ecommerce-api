const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION
});

module.exports.getAllInventory = async () => {
    try {
        // Define the ScanCommand to scan the entire table
        const command = new ScanCommand({
            TableName: 'Inventory-hxojpgz675cmbad5uyoeynwh54-dev'
        });

        // Perform the ScanCommand to get all inventory items
        const data = await dynamoDB.send(command);

        // Unmarshall the items to convert DynamoDB format to JSON
        const items = data.Items.map(item => unmarshall(item));

        // Format the items according to the desired format
        const formattedItems = items.map(item => ({
            unit: item.unit,
            availableQuantity: item.availableQuantity,
            id: item.id,
            productId: item.productId
        }));

        // Return the formatted list of inventory items
        return {
            statusCode: 200,
            body: JSON.stringify(formattedItems),
        };
    } catch (error) {
        console.error('Error getting all inventory items:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to get all inventory items', error: error.message }),
        };
    }
};
