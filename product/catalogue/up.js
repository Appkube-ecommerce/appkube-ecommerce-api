const axios = require('axios');
const AWS = require('aws-sdk');
const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb'); 
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
});
const FACEBOOK_GRAPH_API_URL = process.env.FACEBOOK_GRAPH_API_URL;
const CATALOG_ID = process.env.CATALOG_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

module.exports.handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing request body' }),
      };
    }
console.log("$$$")
    const productData = JSON.parse(event.body);
    const updateFbData = {};

    if (!productData.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required field: id' }),
      };
    }

    console.log("Starting product update process...");

    const tableName = 'Product-hxojpgz675cmbad5uyoeynwh54-dev';
    let updateExpression = 'SET ';
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (productData.price) {
      updateExpression += '#price = :price, ';
      expressionAttributeNames['#price'] = 'price';
      expressionAttributeValues[':price'] = { S: productData.price };
      updateFbData.price = productData.price;
    }

    if (productData.name) {
      updateExpression += '#name = :name, ';
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = { S: productData.name };
      updateFbData.name = productData.name;
    }

    if (productData.description) {
      updateExpression += '#description = :description, ';
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = { S: productData.description };
      updateFbData.description = productData.description;
    }

    if (productData.unit) {
      updateExpression += '#unit = :unit, ';
      expressionAttributeNames['#unit'] = 'unit';
      expressionAttributeValues[':unit'] = { S: productData.unit.toUpperCase() };
    }

    if (productData.category) {
      updateExpression += '#category = :category, ';
      expressionAttributeNames['#category'] = 'category';
      expressionAttributeValues[':category'] = { S: productData.category.toUpperCase() };
      updateFbData.category = productData.category.toUpperCase();
    }

    updateExpression = updateExpression.slice(0, -2);
    expressionAttributeValues[':updatedAt'] = { S: new Date().toISOString()};;
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    updateExpression += ', #updatedAt = :updatedAt';

    const updateParams = {
      TableName: tableName,
      Key: {
        id: { S: productData.id } 
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    console.log("Updating product in DynamoDB...");
    console.log("Update Params:", updateParams);

        const result = await dynamoDB.send(new UpdateItemCommand(updateParams));
        console.log("DynamoDB Update Result:", result);
   
    console.log('Sending update request to Facebook Graph API...');
    const updateProduct = {
      access_token: ACCESS_TOKEN,
      requests: [
        {
          method: 'UPDATE',
          retailer_id: productData.id,
          data: updateFbData
        }
      ]
    };

    const fbApiResponse = await axios.post(`${FACEBOOK_GRAPH_API_URL}/${CATALOG_ID}/batch`, updateProduct);

    console.log("Product update successful.");
 
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Product updated successfully', fbApiResponseData: fbApiResponse.data }),
    };
  } catch (error) {
    console.error('Failed to update product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update product', error: error.message }),
    };
  }
};
