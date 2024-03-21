const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

module.exports.getInventoryById = async (event) => {
    try {
        // Extract the inventory ID from the path parameters
        const inventoryId = event.pathParameters.inventoryId;

        // Define the params for the GetItem operation
        const params = {
            TableName: 'Inventory',
            Key: {
                'inventoryId': { S: inventoryId }
            }
        };

        // Perform the GetItem operation to retrieve the item by ID
        const data = await dynamoDB.send(new GetItemCommand(params));

        // Check if the item exists
        if (!data.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Inventory item not found' }),
            };
        }

        // Return the inventory item
        return {
            statusCode: 200,
            body: JSON.stringify(data.Item),
        };
    } catch (error) {
        console.error('Error getting inventory item by ID:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to get inventory item by ID', error: error.message }),
        };
    }
};
