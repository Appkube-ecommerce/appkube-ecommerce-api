const axios = require('axios');
const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({ region: 'us-east-1' });
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const FACEBOOK_GRAPH_API_URL = process.env.FACEBOOK_GRAPH_API_URL//'https://graph.facebook.com/v19.0';
const CATALOG_ID = process.env.CATALOG_ID //'440032231691394';

const createProductInCatalog = async (productData) => {
  try {
  
   
    const response = await axios.post(`${FACEBOOK_GRAPH_API_URL}/${CATALOG_ID}/batch`, productData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create product in Facebook catalog: ${error.message}`);
  }
};

const saveProductToLocalDynamoDB = async (product) => {
  const params = {
    TableName: 'ProductsTable',
    Item: product,
  };

  try {
    await dynamoDB.put(params).promise();
    console.log('Product saved to DynamoDB:', product);
  } catch (error) {
    console.error('Error saving product to DynamoDB:', error);
  }
};

module.exports.createProduct = async (event) => {
  try {
    const productData = JSON.parse(event.body);
    // Create product in Facebook catalog
    const facebookResponse = await createProductInCatalog(productData);
    // Save product data locally in DynamoDB
    await saveProductToLocalDynamoDB(productData);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Product created successfully', facebookResponse }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to create product', error: error.message }),
    };
  }
};
