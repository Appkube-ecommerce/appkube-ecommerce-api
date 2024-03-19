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
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

const createProductInCatalog = async (productId, productData) => {
  try {
    const response = await axios.post(`${FACEBOOK_GRAPH_API_URL}/${CATALOG_ID}/products?access_token=${ACCESS_TOKEN}`, {
      retailer_id: productId,
      availability: productData.availability,
      brand: productData.brand,
      category: productData.category,
      description: productData.description,
      image_url: productData.image_url,
      name: productData.name,
      price: productData.price,
      currency: productData.currency,
      url: productData.url
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create product in Facebook catalog:', error.response.data);
    throw new Error(`Failed to create product in Facebook catalog: ${error.message}`);
  }
};

const saveProductToLocalDynamoDB = async (productId, productData) => {
  const params = {
    TableName: 'Product',
    Item: {
      productId: { S: productId },
      Image: { S: productData.image_url },
      Title: { S: productData.name },
      Description: { S: productData.description },
      WebsiteLink: { S: productData.url },
      Price: { N: productData.price.toString() },
      Condition: { S: 'New' },
      Availability: { S: productData.availability },
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

    // Generate a unique product ID using UUID
    const productId = uuidv4();

    // Use the same product ID for both operations
    const facebookResponse = await createProductInCatalog(productId, productData);
    await saveProductToLocalDynamoDB(productId, productData);

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
