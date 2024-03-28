const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

const tableName = 'Order-hxojpgz675cmbad5uyoeynwh54-dev';

module.exports.createOrder = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { items, paymentMethod, status } = body;

        // Validate input
        if (!Array.isArray(items) || items.length === 0 || !paymentMethod || !status) {
            throw new Error('Invalid input. "items" must be a non-empty array, "paymentMethod" and "status" are required.');
        }

        const orderId = uuidv4();
        const totalPrice = calculateTotalPrice(items);

        // Prepare order item
        const orderItem = {
            OrderId:  orderId ,
            Items: { L: formatItems(items) },
            PaymentMethod: { S: paymentMethod },
            Status: { S: status },
            TotalPrice: { N: totalPrice.toString() }
        };

        // Save order item to DynamoDB using PutItemCommand
        const putParams = {
            TableName: tableName,
            Item: marshall(orderItem) // Marshall the orderItem
        };

        await dynamoDB.send(new PutItemCommand(putParams));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Order created successfully', orderId: orderId }),
        };
    } catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to process request', error: error.message }),
        };
    }
};

// Calculate total price of items
function calculateTotalPrice(items) {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Format items array for DynamoDB
function formatItems(items) {
    return items.map(item => ({
        M: {
            ProductId: { S: item.productId },
            Quantity: { N: item.quantity.toString() },
            Price: { N: item.price.toString() }
        }
    }));
}
