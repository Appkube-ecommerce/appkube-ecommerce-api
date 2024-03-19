// Import the AWS SDK
const AWS = require('aws-sdk');

// Set the endpoint URL for DynamoDB Local
const endpoint = new AWS.Endpoint('http://localhost:8000');

// Set the region to 'localhost' for DynamoDB Local
AWS.config.update({
    region: 'localhost',
    endpoint : 'http://localhost:8000'
});

// Create a DynamoDB DocumentClient
const docClient = new AWS.DynamoDB.DocumentClient();

// Define the Lambda handler function
exports.deleteCart = async (event) => {
  const itemid = event.pathParameters.itemid; 
    try {
        
const inventory_id=event.pathParameters.inventory_id
        // Define the parameters for the deleteItem operation
        const params = {
            TableName: 'cart',
    Key: {
      'itemId': itemid
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