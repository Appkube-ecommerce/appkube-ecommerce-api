const axios = require('axios');
const AWS = require('aws-sdk');
const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb'); 
require('dotenv').config();


const dynamoDB = new DynamoDBClient({
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
  });
   
const FACEBOOK_GRAPH_API_URL = process.env.FACEBOOK_GRAPH_API_URL
const CATALOG_ID = process.env.CATALOG_ID 
  module.exports.updateProduct = async (event) => {
    try {
      if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing request body' }),
        };
    }
    const requiredFields = ['productId','unit','price'];
    const productData = JSON.parse(event.body);

   for (const field of requiredFields) {
        if (!(field in productData)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: `Missing required field: ${field}` }),
            };
        }
    } 
      const product= {
        "access_token": process.env.ACCESS_TOKEN,
         "requests": [
           {
             "method": "UPDATE",
             "retailer_id":  productData.productId,
             "data":
          {     
            "price": productData.price,
          }
             }      
         ]
       }    
       try {
        const response = await axios.post(`${FACEBOOK_GRAPH_API_URL}/${CATALOG_ID}/batch`, product)
           
      console.log("###",response)

      const params = {
        TableName: 'Product-hxojpgz675cmbad5uyoeynwh54-dev',
        Key: {
            id: { S: productData.productId } // Assuming productId is a string
        },
        UpdateExpression: 'SET #attr1 = :val1, #attr2 = :val2', // Specify the attributes to be updated
        ExpressionAttributeNames: {
            '#attr1': 'unit',
            '#attr2': 'price'
        },
        ExpressionAttributeValues: {
            ':val1': { S: productData.unit }, // Replace 'attribute1' with the corresponding attribute value in updatedProductData
            ':val2': { S: productData.price }  // Replace 'attribute2' with another attribute value if needed
        }
    };
        if(response.status === 200){

            await dynamoDB.send(new UpdateItemCommand(params));
            console.log("$$$$$4")
         
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
    console.error('Failed to create product:', error);
    return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to create product', error: error.message }),
    };
}
};