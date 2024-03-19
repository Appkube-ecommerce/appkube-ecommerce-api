// Import the AWS SDK
const AWS = require('aws-sdk');

// Set the endpoint URL for DynamoDB Local
const endpoint = new AWS.Endpoint('http://localhost:8000');

// Set the region to 'localhost' for DynamoDB Local
AWS.config.update({
    region: 'localhost',
    endpoint
});

// Create a DynamoDB DocumentClient
const docClient = new AWS.DynamoDB.DocumentClient();

// Define the Lambda handler function
exports.deleteProduct = async (event) => {
    try {
        // Parse the request body to get the product_id
        //const { product_id } = JSON.parse(event.body);
const inventory_id=event.pathParameters.inventory_id
        // Define the parameters for the deleteItem operation
        const params = {
            TableName: 'inventory', // Change the table name if needed
            Key: {
                inventory_id: inventory_id // Specify the product_id of the item to delete
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
