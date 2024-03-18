const axios = require('axios');
const AWS = require('aws-sdk');
const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb'); 
require('dotenv').config();


const dynamoDB = new DynamoDBClient({
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
  });
   
const FACEBOOK_GRAPH_API_URL = process.env.FACEBOOK_GRAPH_API_URL//'https://graph.facebook.com/v19.0';
const CATALOG_ID = process.env.CATALOG_ID 
const updateProductInCatalog = async (requestData) => {
    try {
        const response = await axios.post(`${FACEBOOK_GRAPH_API_URL}/${CATALOG_ID}/batch`, requestData);
        return response.data;
      } catch (error) {
        throw new Error(`Failed to update product in Facebook catalog: ${error.message}`);
      }
    };
  
  const updateProductInDynamoDB = async (productId, updatedProductData) => {
    const params = {
        TableName: 'ProductsTable',
        Key: {
            productId: { S: productId } // Assuming productId is a string
        },
        UpdateExpression: 'SET #attr1 = :val1, #attr2 = :val2', // Specify the attributes to be updated
        ExpressionAttributeNames: {
            '#attr1': 'availability',
            '#attr2': 'price'
        },
        ExpressionAttributeValues: {
            ':val1': { S: updatedProductData.availability }, // Replace 'attribute1' with the corresponding attribute value in updatedProductData
            ':val2': { N: updatedProductData.price.toString() }  // Replace 'attribute2' with another attribute value if needed
        }
    };

    try {
        await dynamoDB.send(new UpdateItemCommand(params)); // Use send method to send UpdateItemCommand
        console.log('Product updated in DynamoDB:', productId);
    } catch (error) {
        console.error('Error updating product in DynamoDB:', error);
        throw new Error(`Failed to update product in DynamoDB: ${error.message}`);
    }
};

  module.exports.updateProduct = async (event) => {
    try {
      const requestData = JSON.parse(event.body);
      const accessToken = requestData.access_token; // Access token provided in the request
      const requests = requestData.requests; // Array of update requests
      console.log("%%%%%%",requestData)
      const facebookResponse = await updateProductInCatalog(requestData);
      console.log("************",facebookResponse)
      for (const request of requests) {
        const method = request.method;
        const productIdToUpdate = request.retailer_id;
        const updatedProductData = request.data;

        // Update product in Facebook catalog
     
  
        // Update product data in DynamoDB
        await updateProductInDynamoDB(productIdToUpdate, updatedProductData);
  
        console.log(`Product ${method}d successfully - Retailer ID: ${productIdToUpdate}`);
      }
  
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Products updated successfully' }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to update products', error: error.message }),
      };
    }
  };