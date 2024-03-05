const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'fake',
    secretAccessKey: 'fake'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.OrderPost = async (event) => {
    try {
        const requestBody = JSON.parse(event.body);
        const { order_details, customer_id, product_details, totalprice, createdAt, status } = requestBody;
console.log(product_details)
        const order_id = uuidv4();

        const params = {
            TableName: 'OrderHistory',  
            Item: {
                OrderHistory_id: order_id,
                order_details: order_details,
                customer_id: customer_id,
                product_details: product_details,
                totalprice: totalprice,
                createdAt: createdAt,
                status: status
            }
        };

        // Put item into DynamoDB
        await dynamodb.put(params).promise();
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data inserted successfully' })
        };
    } catch (error) {
        console.error('Error inserting data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error inserting data: ' + error.message })
        };
    }
};
