const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const productId = body.productId;
        const availableQuantity = body.availableQuantity;

        // Validate input
        if (!productId || !availableQuantity || typeof availableQuantity !== 'number') {
            throw new Error('Invalid input. "productId" and "availableQuantity" are required and "availableQuantity" must be a number.');
        }

        // Check if productId exists in the product table
        const getProductParams = {
            TableName: 'Product-hxojpgz675cmbad5uyoeynwh54-dev',
            Key: { id: productId }
        };

        const productData = await dynamoDB.get(getProductParams).promise();

        // If productId does not exist in the product table, return an error
        if (!productData.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Product not found' }),
            };
        }

        // Check if productId already exists in the inventory table
        const getInventoryParams = {
            TableName: 'Inventory-hxojpgz675cmbad5uyoeynwh54-dev',
            FilterExpression: 'productId = :productId',
            ExpressionAttributeValues: { ':productId': productId }
        };
        const inventoryData = await dynamoDB.scan(getInventoryParams).promise();

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
            TableName: 'Inventory-hxojpgz675cmbad5uyoeynwh54-dev',
            Item: {
                id: inventoryId,
                productId: productId,
                availableQuantity: availableQuantity
            },
            // ConditionExpression to check if productId doesn't already exist in the Inventory table
            ConditionExpression: 'attribute_not_exists(productId)'
        };

        await dynamoDB.put(putParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Item added in Inventory successfully' }),
        };
    } catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to process request', error: error.message }),
        };
    }
};
