const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Create DynamoDB client
const dynamoDB = new DynamoDBClient({

});

const tableName = process.env.ORDER_TABLE_NAME;

// Handler function to create an order
module.exports.createOrder = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { items, paymentMethod, status ,customerId,totalPrice} = body;

        // Validate input
        if (!Array.isArray(items) || items.length === 0 || !paymentMethod || !status) {
            throw new Error('Invalid input. "items" must be a non-empty array, "paymentMethod" and "status" are required.');
        }

        const orderId = uuidv4(); // Generate unique ID for the order

        // Prepare order item
        const orderItem = {
            id: orderId, // Ensure id is formatted as a string (S)
            createdAt: new Date().toISOString(), // Auto-generate createdAt timestamp
            customerOrdersId: customerId, // Auto-generate customerOrdersId
            items: items,
            paymentMethod: paymentMethod,
            status: status,
            totalPrice: totalPrice.toString(), // Convert totalPrice to string (N)
            updatedAt: new Date().toISOString(), // Auto-generate updatedAt timestamp
            _lastChangedAt: Date.now().toString(), // Auto-generate _lastChangedAt timestamp
            _version: '1', // Auto-generate _version
            __typename: 'Order' // Set __typename value
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

