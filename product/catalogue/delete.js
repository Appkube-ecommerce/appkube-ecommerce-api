const axios = require('axios');
const { DynamoDBClient, DeleteItemCommand } = require('@aws-sdk/client-dynamodb'); 
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
});

const FACEBOOK_GRAPH_API_URL = process.env.FACEBOOK_GRAPH_API_URL;
const CATALOG_ID = process.env.CATALOG_ID;

const deleteProductInCatalog = async (requestData) => {
    try {
        const response = await axios.post(`${FACEBOOK_GRAPH_API_URL}/${CATALOG_ID}/batch`, requestData);
        return response.data;
    } catch (error) {
        throw new Error(`Failed to delete product in Facebook catalog: ${error.message}`);
    }
};

const deleteProductFromDynamoDB = async (productId) => {
    const params = {
        TableName: 'ProductsTable',
        Key: {
            productId: { S: productId } 
        }
    };

    try {
        await dynamoDB.send(new DeleteItemCommand(params)); 
        console.log('Product deleted from DynamoDB:', productId);
    } catch (error) {
        console.error('Error deleting product from DynamoDB:', error);
        throw new Error(`Failed to delete product from DynamoDB: ${error.message}`);
    }
};

module.exports.deleteProduct = async (event) => {
    try {
        const requestData = JSON.parse(event.body);
        const requests = requestData.requests; // Array of delete requests
        const facebookResponse = await deleteProductInCatalog(requestData);
        for (const request of requests) {
            const productIdToDelete = request.retailer_id;

            // Delete product from DynamoDB
            await deleteProductFromDynamoDB(productIdToDelete);

            console.log(`Product deleted successfully - Retailer ID: ${productIdToDelete}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Products deleted successfully' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to delete products', error: error.message }),
        };
    }
};
