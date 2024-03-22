const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

module.exports.createOrder = async (event) => {
    try {
        // Step 1: Receive and Validate the Request
        const requestBody = JSON.parse(event.body);
        console.log("Request Body:", requestBody);

        const { items, paymentMethod, status, total } = requestBody;
        console.log("Items:", items);
        console.log("Payment Method:", paymentMethod);
        console.log("Status:", status);
        console.log("Total:", total);

        // Generate a unique ID for the order
        const orderId = uuidv4();
        console.log("Order ID:", orderId);

        // Step 2: Insert Data into the Database
        // Check if both product ID and customer ID are available
        const productPromises = items.map(item => {
            const getProductParams = {
                TableName: 'Product',
                Key: { 'productId': { S: item.productId } }
            };
            return dynamoDB.send(new GetItemCommand(getProductParams));
        });

        const customerPromises = items.map(item => {
            const getCustomerParams = {
                TableName: 'Customer',
                Key: { 'customerId': { S: item.customerId } }
            };
            return dynamoDB.send(new GetItemCommand(getCustomerParams));
        });

        // Wait for all product and customer checks to complete
        const productResults = await Promise.all(productPromises);
        const customerResults = await Promise.all(customerPromises);

        // Check if all products and customers exist
        const allProductsExist = productResults.every(result => !!result.Item);
        const allCustomersExist = customerResults.every(result => !!result.Item);

        if (!allProductsExist) {
            throw new Error('One or more products do not exist');
        }

        if (!allCustomersExist) {
            throw new Error('One or more customers do not exist');
        }

        // Prepare order items as AttributeValue objects
        const orderItems = items.map(item => ({
            M: {
                productId: { S: item.productId },
                customerId: { S: item.customerId }, // Add customerId field
                quantity: { N: item.quantity.toString() },
                price: { N: item.price.toString() } 
            }
        }));

        // Prepare order item as an AttributeValue object
        const orderItem = {
            orderId: { S: orderId },
            items: { L: orderItems },
            paymentMethod: { S: paymentMethod },
            status: { S: status },
            total: { S: total }, // Changed to lowercase 'total'
        };

        // Save order to DynamoDB
        const orderParams = {
            TableName: 'Order',
            Item: orderItem
        };

        console.log("Order Params:", orderParams);

        await dynamoDB.send(new PutItemCommand(orderParams));

        // Step 3: Update Inventory
        // Decrease quantity in the inventory table
        for (const item of items) {
            const updateInventoryParams = {
                TableName: 'Inventory',
                Key: { 'productId': { S: item.productId } },
                UpdateExpression: 'SET #quantity = #quantity - :quantity',
                ExpressionAttributeNames: {
                    '#quantity': 'quantity'
                },
                ExpressionAttributeValues: {
                    ':quantity': { N: item.quantity.toString() }
                }
            };

            await dynamoDB.send(new UpdateItemCommand(updateInventoryParams));
        }

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
