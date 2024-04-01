<<<<<<< HEAD
const { DynamoDBClient, UpdateItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
=======
const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
>>>>>>> main
require('dotenv').config();

// Create DynamoDB client
const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

<<<<<<< HEAD
const tableName = process.env.ORDER_TABLE_NAME;

// Handler function to update an order
module.exports.updateOrder = async (event) => {
    try {
        const orderId = event.pathParameters.id; // Extract orderId from the endpoint

        // Validate orderId
        if (!orderId) {
            throw new Error('Invalid orderId.');
        }

        const body = JSON.parse(event.body);
        const { status } = body;

        // Validate input
        if (!status) {
            throw new Error('Invalid input. "status" is required for updating the order.');
        }

        // Get the existing order item from DynamoDB
        const getItemParams = {
            TableName: tableName,
            Key: marshall({ id: orderId })
        };

        const { Item } = await dynamoDB.send(new GetItemCommand(getItemParams));

        if (!Item) {
            throw new Error('Order not found.');
        }

        // Update the status of the order
        const updatedOrder = {
            ...unmarshall(Item),
            status: status,
            updatedAt: new Date().toISOString()
        };

        // Save the updated order item to DynamoDB using UpdateItemCommand
        const updateParams = {
            TableName: tableName,
            Key: marshall({ id: orderId }),
            UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
            ExpressionAttributeNames: {
                "#status": "status"
            },
            ExpressionAttributeValues: {
                ":status": { S: updatedOrder.status },
                ":updatedAt": { S: updatedOrder.updatedAt }
            },
            ReturnValues: "ALL_NEW"
        };

        const { Attributes } = await dynamoDB.send(new UpdateItemCommand(updateParams));
=======
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
>>>>>>> main

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Order updated successfully', order: unmarshall(Attributes) }),
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
