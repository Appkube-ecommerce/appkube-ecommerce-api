const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

module.exports.createOrder = async (event) => {
    try {
        // Parse the request body to extract order details
        const requestBody = JSON.parse(event.body);
        const { items, paymentMethod, status, total } = requestBody;

        // Ensure items array is defined and not empty
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('Items array is missing or empty');
        }

        // Ensure each item in the array has the required properties
        for (const item of items) {
            if (!item || typeof item !== 'object' || !item.productId || !item.quantity) {
                throw new Error('Each item must be an object with productId and quantity properties');
            }
        }

        // Generate a unique order ID
        const orderId = uuidv4();

        // Prepare the order item
        const orderItem = {
            OrderId: orderId,
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            })),
            paymentMethod,
            status,
            total
        };

        console.log("## Order Item:", orderItem);


        const params = {
            TableName: 'Order-hxojpgz675cmbad5uyoeynwh54-dev',
            Item: {
                'OrderId': { S: orderItem.OrderId }, // Partition key attribute
                'items': { L: orderItem.items.map(item => ({ M: item })) }, // Assuming items is a list (L) of map (M)
                'paymentMethod': { S: orderItem.paymentMethod }, // Assuming paymentMethod is of type string (S)
                'status': { S: orderItem.status }, // Assuming status is of type string (S)
                'total': { N: orderItem.total.toString() } // Assuming total is of type number (N)
            }
        };
        
        

        console.log("## PutItemCommand Params:", params);

        // Perform the PutItem operation to create the order
        const result = await dynamoDB.send(new PutItemCommand(params));

        console.log("## PutItemCommand Result:", result);

        // Return success response
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Order created successfully', orderId }),
        };
    } catch (error) {
        console.error('Error creating order:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to create order', error: error.message }),
        };
    }
};
