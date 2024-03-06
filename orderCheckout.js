const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
    region: 'localhost',  
    endpoint: 'http://localhost:8000'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const status_pending = 'pending';  

exports.checkout = async (event) => {
    try {
        const requestBody = JSON.parse(event.body);
        const { product_list } = requestBody;
        const currentTime = new Date().toISOString();

        const orderId = uuidv4();
        const params = {
            TableName: 'order',  
            Item: {
                order_Id: orderId,
                product_list: product_list,
                created_at: currentTime
                
            }
        };

        await dynamodb.put(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ orderId }) 
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify('Error creating order: ' + error.message)
        };
    }
};
