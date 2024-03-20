const axios = require('axios');
const { DynamoDBClient, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();
 
const dynamoDB = new DynamoDBClient({
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
});
 
const FACEBOOK_GRAPH_API_URL = process.env.FACEBOOK_GRAPH_API_URL;
const CATALOG_ID = process.env.CATALOG_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
module.exports.deleteProduct = async (event) => {
    try {
        if (!event.body) {
          return {
              statusCode: 400,
              body: JSON.stringify({ message: 'Missing request body' }),
          };
      }
      const requiredFields = ['productId','unit','price'];
      const productData = JSON.parse(event.body);
  
     
          if (!(productData.productId)) {
              return {
                  statusCode: 400,
                  body: JSON.stringify({ message: `Missing required field: ${field}` }),
              };
          }
       
      console.log("$$$",productData.productId)
        // Array of update requests
        const product= {
            "access_token": ACCESS_TOKEN,
             "requests": [
               {
                 "method": "DELETE",
                 "retailer_id":  productData.productId,
                 }   
             ]
           }    
         try {
          const response = await axios.post(`${FACEBOOK_GRAPH_API_URL}/${CATALOG_ID}/batch`, product)
             
        console.log("###",response)
  
        const params = {
            TableName: 'Products',
            Key: {
                productId: { S: productData.productId } // Assuming productId is a string
            }
        };
          if(response.status === 200){
            await dynamoDB.send(new DeleteItemCommand(params));
          }
         return {
              statusCode: 200,
              body: JSON.stringify({ message: 'Product deleted successfully' }),
          };
      } catch (error) {
          console.error('Failed to deleted product in database:', error.response ? error.response.data : error.message);
          return {
              statusCode: error.response ? error.response.status : 500,
              body: JSON.stringify({ message: 'Failed to delete product in database', error: error.response ? error.response.data : error.message }),
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
      
  