const { DynamoDBClient, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

module.exports.updateInventoryItem = async (event) => {
    try {
        const { inventoryId, quantity } = JSON.parse(event.body);

        // Validate input
        if (!inventoryId || !quantity || typeof quantity !== 'number') {
            throw new Error('Invalid input. "inventoryId" and "quantity" are required and "quantity" must be a number.');
        }

        // Check if the inventory item exists
        const getItemParams = {
            TableName: 'Inventory',
            Key: {
                inventoryId: { S: inventoryId }
            }
        };

        const existingItem = await dynamoDB.send(new GetItemCommand(getItemParams));

        if (!existingItem.Item) {
            throw new Error('Inventory item not found.');
        }

        // Update the quantity of the existing item
        const updateParams = {
            TableName: 'Inventory',
            Key: {
                inventoryId: { S: inventoryId }
            },
            UpdateExpression: 'SET quantity = :quantity',
            ExpressionAttributeValues: {
                ':quantity': { N: quantity.toString() }
            }
        };

        await dynamoDB.send(new UpdateItemCommand(updateParams));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Inventory item updated successfully' }),
        };
    } catch (error) {
        console.error('Error updating inventory item:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to update inventory item', error: error.message }),
        };
    }
};
