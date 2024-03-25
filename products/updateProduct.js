const axios = require('axios');
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient(); // Instantiate DocumentClient directly
const { UpdateItemCommand, GetItemCommand } = AWS.DynamoDB.DocumentClient; // Destructure the commands
require('dotenv').config();

const FACEBOOK_GRAPH_API_URL = process.env.FACEBOOK_GRAPH_API_URL;
const CATALOG_ID = process.env.CATALOG_ID;

module.exports.handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing request body' }),
      };
    }
    const requiredFields = ['productId', 'unit', 'price'];
    const productData = JSON.parse(event.body);

    for (const field of requiredFields) {
      if (!(field in productData)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: `Missing required field: ${field}` }),
        };
      }
    }

    const getProductParams = {
      TableName: 'Product-hxojpgz675cmbad5uyoeynwh54-dev',
      Key: {
        id: productData.productId // No need for { S: ... } if productId is already a string
      }
    };

    const getProductResponse = await dynamoDB.get(getProductParams).promise(); // Use `get` method and `promise()`

    if (!getProductResponse.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }

    const product = {
      "access_token": process.env.FACEBOOK_ACCESS_TOKEN,
      "requests": [
        {
          "method": "UPDATE",
          "retailer_id": productData.productId,
          "data":
          {
            "price": productData.price,
          }
        }
      ]
    };

    try {
      const response = await axios.post(`${FACEBOOK_GRAPH_API_URL}/${CATALOG_ID}/batch`, product);

      console.log("###", response);

      const params = {
        TableName: 'Product-hxojpgz675cmbad5uyoeynwh54-dev',
        Key: {
          id: productData.productId // Assuming productId is a string
        },
        UpdateExpression: 'SET #attr1 = :val1, #attr2 = :val2', // Specify the attributes to be updated
        ExpressionAttributeNames: {
          '#attr1': 'unit',
          '#attr2': 'price'
        },
        ExpressionAttributeValues: {
          ':val1': productData.unit, // No need for { S: ... } if unit and price are strings
          ':val2': productData.price
        }
      };

      if (response.status === 200) {
        await dynamoDB.update(params).promise(); // Use `update` method and `promise()`
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Product updated successfully' }),
      };
    } catch (error) {
      console.error('Failed to update product in database:', error.response ? error.response.data : error.message);
      return {
        statusCode: error.response ? error.response.status : 500,
        body: JSON.stringify({ message: 'Failed to update product in database', error: error.response ? error.response.data : error.message }),
      };
    }
  } catch (error) {
    console.error('Failed to update product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update product', error: error.message }),
    };
  }
};
