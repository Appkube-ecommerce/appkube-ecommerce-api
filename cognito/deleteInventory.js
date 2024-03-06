// Import the AWS SDK
const AWS = require('aws-sdk');


const endpoint = new AWS.Endpoint('http://localhost:8000');


AWS.config.update({
    region: 'localhost',
    endpoint
});


const docClient = new AWS.DynamoDB.DocumentClient();


exports.deleteProduct = async (event) => {
    try {
     
const inventory_id=event.pathParameters.inventory_id
        // Define the parameters for the deleteItem operation
        const params = {
            TableName: 'inventory', 
            Key: {
                inventory_id: inventory_id 
            }
        };

        // Delete the product from the table
        const data = await docClient.delete(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Item deleted successfully', data })
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Unable to delete item', error: err })
        };
    }
};
