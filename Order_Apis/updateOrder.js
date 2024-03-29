const { DynamoDBClient, UpdateItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
require('dotenv').config();

// Create DynamoDB client
const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

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
