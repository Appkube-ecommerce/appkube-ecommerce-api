const { DynamoDBClient, UpdateItemCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
  region: process.env.REGION,
  endpoint: process.env.ENDPOINT
});

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

const saveProductToLocalDynamoDB = async (productData) => {
  if (!productData.requests || !Array.isArray(productData.requests) || productData.requests.length === 0) {
    throw new Error('Invalid productData: requests array is missing or empty');
  }

  const productId = productData.requests[0].method === 'UPDATE' ? productData.requests[0].retailer_id : uuidv4(); // Use existing productId for update or generate a new one for create

  let command;
  if (productData.requests[0].method === 'UPDATE') {
    command = new UpdateItemCommand({
      TableName: 'Product',
      Key: { productId: { S: productId } },
      UpdateExpression: 'SET #Image = :image, #Title = :title, #Description = :description, #WebsiteLink = :websiteLink, #Price = :price, #Availability = :availability, #Status = :status',
      ExpressionAttributeNames: {
        '#Image': 'Image',
        '#Title': 'Title',
        '#Description': 'Description',
        '#WebsiteLink': 'WebsiteLink',
        '#Price': 'Price',
        '#Availability': 'Availability',
        '#Status': 'Status'
      },
      ExpressionAttributeValues: {
        ':image': { S: productData.requests[0].data.image_url },
        ':title': { S: productData.requests[0].data.name },
        ':description': { S: productData.requests[0].data.description },
        ':websiteLink': { S: productData.requests[0].data.url },
        ':price': { N: productData.requests[0].data.price.toString() },
        ':availability': { S: productData.requests[0].data.availability },
        ':status': { S: 'Active' }
      }
    });
  } else {
    command = new PutItemCommand({
      TableName: 'Product',
      Item: {
        productId: { S: productId },
        Image: { S: productData.requests[0].data.image_url },
        Title: { S: productData.requests[0].data.name },
        Description: { S: productData.requests[0].data.description },
        WebsiteLink: { S: productData.requests[0].data.url },
        Price: { N: productData.requests[0].data.price.toString() },
        Availability: { S: productData.requests[0].data.availability },
        Status: { S: 'Active' }
      }
    });
  }

  try {
    await dynamoDB.send(command);
    console.log('Product  updated data saved in DynamoDB:', productData);
  } catch (error) {
    console.error('Error saving product to DynamoDB:', error);
    throw new Error(`Failed to save product to DynamoDB: ${error.message}`);
  }
};

module.exports.updateProduct = async (event) => {
  try {
    const productData = JSON.parse(event.body);
 
    const facebookResponse = await updateProductInCatalog(productData);

    await saveProductToLocalDynamoDB(productData);

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
