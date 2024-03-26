const { DynamoDBClient, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

module.exports.deleteInventoryById = async (event) => {
    try {
        // Extract the inventory ID from the path parameters
        const inventoryId = event.pathParameters.inventoryId;

        // Define the params for the DeleteItem operation
        const params = {
            TableName: 'Inventory-hxojpgz675cmbad5uyoeynwh54-dev',
            Key: {
                'inventoryId': { S: inventoryId }
            }
        };

        // Perform the DeleteItem operation to delete the item by ID
        await dynamoDB.send(new DeleteItemCommand(params));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Inventory item deleted successfully' }),
        };
    } catch (error) {
        console.error('Error deleting inventory item by ID:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to delete inventory item by ID', error: error.message }),
        };
    }
};
