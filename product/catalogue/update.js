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
const updateProductInCatalog = async (product) => {
    try {
    
        const response = await axios.post(`${FACEBOOK_GRAPH_API_URL}/${CATALOG_ID}/batch`, product);
        return response.data;
      } catch (error) {
        throw new Error(`Failed to update product in Facebook catalog: ${error.message}`);
      }
    };
  
  const updateProductInDynamoDB = async (productId,availability,price) => {
    const params = {
        TableName: 'Products',
        Key: {
            productId: { S: productId } // Assuming productId is a string
        },
        UpdateExpression: 'SET #attr1 = :val1, #attr2 = :val2', // Specify the attributes to be updated
        ExpressionAttributeNames: {
            '#attr1': 'availability',
            '#attr2': 'Price'
        },
        ExpressionAttributeValues: {
            ':val1': { S: availability }, // Replace 'attribute1' with the corresponding attribute value in updatedProductData
            ':val2': { N: price }  // Replace 'attribute2' with another attribute value if needed
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
      const {productId,availability,price} = JSON.parse(event.body);
      
      // Array of update requests
      const product= {
        "access_token": process.env.ACCESS_TOKEN,
         "requests": [
           {
             "method": "UPDATE",
             "retailer_id":  productId,
             "data":
          {
            "availability": availability,
            "price": price,
          }
             }
             
           
         ]
       }
    
      const facebookResponse = await updateProductInCatalog(product);
    
        // Update product data in DynamoDB
        await updateProductInDynamoDB(productId,availability,price);
  
        console.log(`Product updated successfully - Retailer ID: `);
     
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