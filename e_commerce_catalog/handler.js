const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
  region: process.env.REGION,
  endpoint: process.env.ENDPOINT
});

const FACEBOOK_GRAPH_API_URL = process.env.FACEBOOK_GRAPH_API_URL;
const CATALOG_ID = process.env.CATALOG_ID;

const createProductInCatalog = async (productData) => {
  try {
    const response = await axios.post(`${FACEBOOK_GRAPH_API_URL}/${CATALOG_ID}/batch`, productData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create product in Facebook catalog: ${error.message}`);
  }
};


const saveProductToLocalDynamoDB = async (productData) => {
  const productId = uuidv4(); // Generate a unique product ID using UUID
  const params = {
    TableName: 'Product',
    Item: {
      productId: { S: productId },
      Image: { S: productData.requests[0].data.image_url },
      Title: { S: productData.requests[0].data.name },
      Description: { S: productData.requests[0].data.description },
      WebsiteLink: { S: productData.requests[0].data.url },
      Price: { N: productData.requests[0].data.price.toString() },
      Condition: { S: 'New' },
      Availability: { S: productData.requests[0].data.availability },
      Status: { S: 'Active' }
    }
  };

  try {
    await dynamoDB.send(new PutItemCommand(params));
    console.log('Product saved to DynamoDB:', productData);
  } catch (error) {
    console.error('Error saving product to DynamoDB:', error);
    throw new Error(`Failed to save product to DynamoDB: ${error.message}`);
  }
};

module.exports.createProduct = async (event) => {
  try {
    const productData = JSON.parse(event.body);

    const facebookResponse = await createProductInCatalog(productData);

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
