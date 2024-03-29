const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

module.exports.getAllOrders = async (event) => {
    try {
        // Define parameters for the scan operation
        const scanParams = {
            TableName: 'Order-hxojpgz675cmbad5uyoeynwh54-dev'
        };

        // Perform the scan operation to retrieve all items from the Order table
        const data = await dynamoDB.send(new ScanCommand(scanParams));

        // Check if any items were retrieved
        if (!data.Items || !Array.isArray(data.Items)) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'No orders found' }),
            };
        }

        // Extract the items from the response
        const orders = data.Items.map(item => ({
            orderId: item.orderId?.S || '',
            items: (item.items?.L || []).map(orderItem => ({
                productId: orderItem?.M?.productId?.S || '',
                quantity: parseInt(orderItem?.M?.quantity?.N || '0'),
                price: parseFloat(orderItem?.M?.price?.N || '0')
            })),
            paymentMethod: item.paymentMethod?.S || '',
            status: item.status?.S || '',
            totalAmount: parseFloat(item.totalAmount?.N || '0')
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(orders),
        };
    } catch (error) {
        console.error('Error retrieving orders:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to retrieve orders', error: error.message }),
        };
    }
};