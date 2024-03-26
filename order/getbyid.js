const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

module.exports.getByOrderId = async (event) => {
    try {
        const orderId = event.pathParameters.orderId;
        console.log("Order ID:", orderId);

        const params = {
            TableName: 'Order',
            Key: {
                'orderId': { S: orderId }
            }
        };

        const { Item } = await dynamoDB.send(new GetItemCommand(params));

        if (!Item) {
            throw new Error('Order not found');
        }

        const order = {
            orderId: Item.orderId.S,
            items: Item.items.L.map(item => ({
                productId: item.M.productId.S,
                customerId: item.M.customerId.S,
                quantity: parseInt(item.M.quantity.N),
                price: parseFloat(item.M.price.N)
            })),
            paymentMethod: Item.paymentMethod.S,
            status: Item.status.S,
            total: Item.total.S // Assuming total is defined as a string
        };

        console.log("Retrieved Order:", order);

        return {
            statusCode: 200,
            body: JSON.stringify({ order }),
        };
    } catch (error) {
        console.error('Error retrieving order by ID:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to retrieve order', error: error.message }),
        };
    }
};
