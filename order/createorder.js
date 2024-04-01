const { DynamoDBClient, GetItemCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
require('dotenv').config();

const { v4: uuidv4 } = require('uuid');

// Create DynamoDB client with options to remove undefined values
const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT,
    removeUndefinedValues: true
});

const orderTableName = process.env.ORDER_TABLE_NAME;
const customerTableName = process.env.CUSTOMER_TABLE_NAME;
const productTableName = process.env.PRODUCT_TABLE_NAME;

// Generate a random 5-digit number
function generateRandomOrderId() {
    return Math.floor(10000 + Math.random() * 90000);
}

// Handler function to create an order
module.exports.createOrder = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { items, customerId, totalPrice } = body;

        // Validate input
        if (!Array.isArray(items) || items.length === 0 || !customerId || !totalPrice) {
            throw new Error('Invalid input. "items" must be a non-empty array, "customerId" and "totalPrice" are required.');
        }

        const orderId = generateRandomOrderId().toString();

        // Fetch customer details
        const getCustomerParams = {
            TableName: customerTableName,
            Key: marshall({ id: customerId })
        };
        const { Item: customerItem } = await dynamoDB.send(new GetItemCommand(getCustomerParams));
        if (!customerItem) {
            throw new Error('Customer not found');
        }

        // Fetch product details for each item
        const products = [];
        for (const item of items) {
            const getProductParams = {
                TableName: productTableName,
                Key: marshall({ id: item.productId })
            };
            const { Item: productItem } = await dynamoDB.send(new GetItemCommand(getProductParams));
            if (!productItem) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            products.push(unmarshall(productItem));
        }

        // Prepare order item
        const orderItem = {
            id: orderId,
            createdAt: new Date().toISOString(),
            customerOrdersId: uuidv4(),
            items: items.map(item => ({
                quantity: item.quantity
            })),
            paymentMethod: body.paymentMethod || "Credit Card",
            status: body.status || "Pending",
            totalPrice: totalPrice.toString(),
            customerId: customerId,
            //customerDetails: customerItem,
            products: products,
            updatedAt: new Date().toISOString(),
            _lastChangedAt: Date.now().toString(),
            _version: '1',
            __typename: 'Order'
        };

        // Save order item to DynamoDB using PutItemCommand
        const putParams = {
            TableName: orderTableName,
            Item: marshall(orderItem)
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
