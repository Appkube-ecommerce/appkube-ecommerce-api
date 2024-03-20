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
        console.log("###",requestData)
        const response = await axios.post(`${FACEBOOK_GRAPH_API_URL}/${CATALOG_ID}/batch`, requestData);
        console.log("$$$",response.data)
        return response.data;
    } catch (error) {
        throw new Error(`Failed to delete product in Facebook catalog: ${error.message}`);
    }
};
 
const deleteProductFromDynamoDB = async (productId) => {
    const params = {
        TableName: 'Products',
        Key: {
            productId: { S: productId } // Assuming productId is a string
        }
    };
 
    try {
        await dynamoDB.send(new DeleteItemCommand(params)); // Use send method to execute DeleteItemCommand
        console.log('Product deleted from DynamoDB:', productId);
    } catch (error) {
        console.error('Error deleting product from DynamoDB:', error);
        throw new Error(`Failed to delete product from DynamoDB: ${error.message}`);
    }
};
 
module.exports.deleteProduct = async (event) => {
    try {
        const {productId}= JSON.parse(event.body);
        const product= {
            "access_token": process.env.ACCESS_TOKEN,
             "requests": [
               {
                 "method": "DELETE",
                 "retailer_id":  productId,
                 }   
             ]
           }
        const facebookResponse = await deleteProductInCatalog(product);
     console.log("$$$$$$$",facebookResponse)
            await deleteProductFromDynamoDB(productId);
 
            console.log(`Product deleted successfully `);
        
 
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Products deleted successfully' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to delete products' }),
        };
    }
};