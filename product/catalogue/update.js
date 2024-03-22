const axios = require('axios');
const AWS = require('aws-sdk');
const { DynamoDBClient, UpdateItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb'); 
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
});

const FACEBOOK_GRAPH_API_URL = process.env.FACEBOOK_GRAPH_API_URL;
const CATALOG_ID = process.env.CATALOG_ID;

module.exports.updateProduct = async (event) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing request body' }),
            };
        }

        const productData = JSON.parse(event.body);
        const update = productData.update;

        const getProductParams = {
            TableName: 'Product-hxojpgz675cmbad5uyoeynwh54-dev',
            Key: {
                id: { S: productData.productId }
            }
        };

        const getProductResponse = await dynamoDB.send(new GetItemCommand(getProductParams));
     
        if (!getProductResponse.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Product not found' }),
            };
        }

        const product = {
            "access_token": process.env.ACCESS_TOKEN,
            "requests": [
                {
                    "method": "UPDATE",
                    "retailer_id":  productData.productId,
                    "data":   update
                }      
            ]
        };

        console.log("Sending update request to Facebook Graph API:", product);

        try {
            const response = await axios.post(`${FACEBOOK_GRAPH_API_URL}/${CATALOG_ID}/batch`, product);
            console.log("Response from Facebook Graph API:", response.data);

            const params = {
                TableName: 'Product-hxojpgz675cmbad5uyoeynwh54-dev',
                Key: {
                    id: { S: productData.productId } 
                },
                UpdateExpression: 'SET', 
                ExpressionAttributeNames: {}, 
                ExpressionAttributeValues: {}, 
            };

        
            Object.keys(update).forEach((key, index) => {

                params.ExpressionAttributeNames[`#attr${index+1}`] = key;

                params.ExpressionAttributeValues[`:val${index+1}`] = { S: update[key] };

                params.UpdateExpression += ` #attr${index+1} = :val${index+1},`;
            });


            params.UpdateExpression = params.UpdateExpression.slice(0, -1);

            try {
  
                const result = await dynamoDB.send(new UpdateItemCommand(params));
                console.log("Product updated successfully:", result);

                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'Product updated successfully' }),
                };
            } catch (error) {
                console.error('Failed to update product in database:', error);
                return {
                    statusCode: error.$metadata.httpStatusCode || 500,
                    body: JSON.stringify({ message: 'Failed to update product in database', error: error.message }),
                };
            }
        } catch (error) {
            console.error('Failed to update product via Facebook Graph API:', error.response ? error.response.data : error.message);
            return {
                statusCode: error.response ? error.response.status : 500,
                body: JSON.stringify({ message: 'Failed to update product via Facebook Graph API', error: error.response ? error.response.data : error.message }),
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

