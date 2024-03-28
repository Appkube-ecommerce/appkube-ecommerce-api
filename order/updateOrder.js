const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

const tableName = 'Order-hxojpgz675cmbad5uyoeynwh54-dev';

module.exports.updateOrder = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const orderId = event.pathParameters.orderId;
        const { items, paymentMethod, status } = body;

        // Validate input
        if (!Array.isArray(items) || items.length === 0 || !paymentMethod || !status) {
            throw new Error('Invalid input. "items" must be a non-empty array, "paymentMethod" and "status" are required.');
        }

        // Calculate total price of items
        const totalPrice = calculateTotalPrice(items);

        // Prepare update expression and attribute values
        let updateExpression = 'SET #items = :items, PaymentMethod = :paymentMethod, #status = :status, TotalPrice = :totalPrice';
        const expressionAttributeNames = {
            '#items': 'Items',
            '#status': 'Status'
        };
        const expressionAttributeValues = marshall({
            ':items': formatItems(items),
            ':paymentMethod': paymentMethod,
            ':status': status,
            ':totalPrice': totalPrice.toString()
        });

        // Update order item in DynamoDB using UpdateItemCommand
        const updateParams = {
            TableName: tableName,
            Key: marshall({ OrderId: orderId }), // Marshall the key
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues, // Marshall the updated order item
            ReturnValues: 'ALL_NEW'
        };

        const updatedOrderResult = await dynamoDB.send(new UpdateItemCommand(updateParams));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Order updated successfully', updatedOrder: updatedOrderResult.Attributes }),
        };
    } catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to process request', error: error.message }),
        };
    }
};

// Function to calculate total price of items
function calculateTotalPrice(items) {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Function to format items array for DynamoDB
function formatItems(items) {
    return items.map(item => ({
        ProductId: item.productId,
        Quantity: item.quantity,
        Price: item.price
    }));
}
