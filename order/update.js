const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

module.exports.updateOrder = async (event) => {
    try {
        const requestBody = JSON.parse(event.body);
        console.log("Request Body:", requestBody);

        const { orderId, items, paymentMethod, status, total } = requestBody;
        console.log("Order ID:", orderId);
        console.log("Items:", items);
        console.log("Payment Method:", paymentMethod);
        console.log("Status:", status);
        console.log("Total:", total);

        // Check if the order exists
        const getOrderParams = {
            TableName: 'Order',
            Key: { 'orderId': { S: orderId } }
        };

        const orderResult = await dynamoDB.send(new GetItemCommand(getOrderParams));

        if (!orderResult.Item) {
            throw new Error('Order not found');
        }

        // Prepare updated order item
        const updatedOrderItem = {
            orderId: { S: orderId },
            items: { L: items.map(item => ({
                M: {
                    productId: { S: item.productId },
                    customerId: { S: item.customerId },
                    quantity: { N: item.quantity.toString() },
                    price: { N: item.price.toString() }
                }
            }))},
            paymentMethod: { S: paymentMethod },
            status: { S: status },
            total: { N: total.toString() } // Assuming total is a number
        };

        // Update order in the database
        const updateOrderParams = {
            TableName: 'Order',
            Key: { 'orderId': { S: orderId } },
            UpdateExpression: 'SET #items = :items, paymentMethod = :paymentMethod, #status = :status, #total = :total',
            ExpressionAttributeNames: {
                '#items': 'items',
                '#status': 'status',
                '#total': 'total' // Use an alias for the reserved keyword "total"
            },
            ExpressionAttributeValues: {
                ':items': updatedOrderItem.items,
                ':paymentMethod': updatedOrderItem.paymentMethod,
                ':status': updatedOrderItem.status,
                ':total': updatedOrderItem.total
            },
            ReturnValues: 'ALL_NEW'
        };

        const updatedOrderResult = await dynamoDB.send(new UpdateItemCommand(updateOrderParams));

        console.log("Updated Order:", updatedOrderResult);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Order updated successfully', updatedOrder: updatedOrderResult.Attributes }),
        };
    } catch (error) {
        console.error('Error updating order:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to update order', error: error.message }),
        };
    }
};
