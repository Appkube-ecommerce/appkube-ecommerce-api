const axios = require('axios');
const AWS = require('aws-sdk');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
   region: 'us-east-1',
 endpoint: 'http://localhost:8000'
 });
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

const saveProductToLocalDynamoDB = async (productData) => {

  //S: productData.requests[0].data.image_url }

 

  const params = {
    TableName: 'Products',
    Item: {
      productId: productData.requests[0].retailer_id,
      Image: productData.requests[0].data.image_url, 
      Title: productData.requests[0].data.name, 
      Description: productData.requests[0].data.description, 
      WebsiteLink: productData.requests[0].data.url, 
      Price: productData.requests[0].data.price, 
      Condition: 'New', 
      Availability: productData.requests[0].data.availability, 
      Status: 'Active'
    },
  };

  try {
    await dynamoDB.put(params).promise();
    console.log('Product saved to DynamoDB:');
  } catch (error) {
    console.error('Error saving product to DynamoDB:', error);
  }
};

module.exports.createProduct = async (event) => {
  try {
    const productData = JSON.parse(event.body);
   
    const productid= uuidv4();
   
   const product= {
       "access_token": process.env.ACCESS_TOKEN,
        "requests": [
          {
            "method": "CREATE",
            "retailer_id":  productid,
            "data":
          productData
            }
            
          
        ]
      }
    
  
    // Create product in Facebook catalog
    const facebookResponse = await createProductInCatalog(product);
    // Save product data locally in DynamoDB
    await saveProductToLocalDynamoDB(product);
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
