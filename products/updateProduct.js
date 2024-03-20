const { DynamoDBClient, UpdateItemCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const FACEBOOK_GRAPH_API_URL = process.env.FACEBOOK_GRAPH_API_URL;
const CATALOG_ID = process.env.CATALOG_ID;

const updateProductInCatalog = async (productData) => {
  try {
    const response = await axios.post(`${FACEBOOK_GRAPH_API_URL}/${CATALOG_ID}/batch`, productData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to updated product in Facebook catalog: ${error.message}`);
  }
};


module.exports.updateProduct = async (event) => {
  try {
    const productData = JSON.parse(event.body);
 
    const facebookResponse = await updateProductInCatalog(productData);


    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Product update successfully', facebookResponse }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update product', error: error.message }),
    };
  }
};