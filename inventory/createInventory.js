const { DynamoDBClient, PutItemCommand, ScanCommand ,GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

module.exports.createInventoryItem = async (event) => {
    try {
        let { productId, quantity } = {};
        try {
            const body = JSON.parse(event.body || '{}');
            productId = body.productId;
            quantity = body.quantity;
        } catch (e) {
            throw new Error('Invalid input format. "productId" and "quantity" are required.');
        }

        // Validate input
        if (!productId || !quantity || typeof quantity !== 'number') {
            throw new Error('Invalid input. "productId" and "quantity" are required and "quantity" must be a number.');
        }
          // Check if productId exists in the product table
          const getProductParams = {
            TableName: 'Product',
            Key: {
                'productId': { S: productId }
            }
        };
        
        const getInventoryParams = {
            TableName: 'Inventory',
            FilterExpression: 'productId = :productId',
            ExpressionAttributeValues: {
                ':productId': { S: productId }
            }
        };
    
        const productData = await dynamoDB.send(new GetItemCommand(getProductParams));
        const inventoryData = await dynamoDB.send(new ScanCommand(getInventoryParams));

        // If productId does not exist in the product table, return an error
        if (!productData.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Product not found' }),
            };
        }
         
        // If productId already exists in the inventory table, return an error
        if (inventoryData.Items.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Product already exists in inventory' }),
            };
        }

        // Generate a unique ID for the inventory item
        const inventoryId = uuidv4();

        // Save inventory item to DynamoDB
        const putParams = {
            TableName: 'Inventory',
            Item: {
                inventoryId: { S: inventoryId },
                productId: { S: productId },
                quantity: { N: quantity.toString() }
            },
            // ConditionExpression to check if productId doesn't already exist in the Inventory table
            ConditionExpression: 'attribute_not_exists(productId)'
        };

        try {
            await dynamoDB.send(new PutItemCommand(putParams));
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Item added in Inventory successfully' }),
            };
        } catch (error) {
            // Handle ConditionalCheckFailedException when productId already exists in the Inventory table
            if (error.name === 'ConditionalCheckFailedException') {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Product already exists in inventory' }),
                };
            }
            console.error('Error creating inventory item:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Failed to create inventory item', error: error.message }),
            };
        }
    } catch (error) {
        console.error('Error parsing event body:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Failed to parse event body', error: error.message }),
        };
    }
};
