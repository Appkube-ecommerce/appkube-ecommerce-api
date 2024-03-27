// import necessary modules
const { DynamoDBClient, PutItemCommand, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// create DynamoDB client
const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

// define the createOrder handler
module.exports.createOrder = async (event) => {
    try {
        // parse the request body
        const requestBody = JSON.parse(event.body);

        // extract relevant information from the request body
        const { items, paymentMethod, status, total } = requestBody;

        // generate a unique order ID
        const orderId = uuidv4();

        // validate if all required keys are present in the request body
        if (!items || !paymentMethod || !status || !total) {
            throw new Error('One or more required keys are missing from the request body');
        }

        // Save the order details to DynamoDB
        const orderItem = {
            orderId,
            items,
            paymentMethod,
            status,
            total
        };

        const putOrderParams = {
            TableName: 'Order',
            Item: orderItem
        };

        await dynamoDB.send(new PutItemCommand(putOrderParams));

        // Update inventory in batches
        const batchRequests = items.map(item => ({
            PutRequest: {
                Item: {
                    productId: item.productId,
                    quantity: item.quantity
                }
            }
        }));

        const batchParams = {
            RequestItems: {
                'Inventory': batchRequests
            }
        };

        await dynamoDB.send(new BatchWriteItemCommand(batchParams));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Order created successfully' }),
        };
    } catch (error) {
        console.error('Error creating order:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to create order', error: error.message }),
        };
    }
};