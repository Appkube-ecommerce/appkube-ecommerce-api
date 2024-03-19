const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummyAccessKeyId',
    secretAccessKey: 'dummySecretAccessKey',
  },
});

async function getByCustomerId(event) {
    try {
      // Extract the customer_id from path parameters
      const { customer_id } = event.pathParameters;
      console.log('Fetching item for customer_id:', customer_id);
  
      // Ensure customer_id is not undefined or empty
      if (!customer_id) {
        console.error('Invalid customer_id:', customer_id);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid customer_id' }),
        };
      }
  
      // Define parameters for retrieving the item from DynamoDB
      const params = {
        TableName: 'Order',
        Key: {
          'customer_id': { N: customer_id.toString() },
        },
      };
      console.log('GetItemCommand params:', params);
  
      // Retrieve the item from DynamoDB
      const data = await client.send(new GetItemCommand(params));
      console.log('Retrieved item:', data);
  
      // Check if the item exists
      if (!data.Item) {
        console.error('Item not found for customer_id:', customer_id);
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Item not found' }),
        };
      }
  
      // Return the retrieved item
      return {
        statusCode: 200,
        body: JSON.stringify(data.Item),
      };
    } catch (error) {
      console.error('Error retrieving item:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      };
    }
  }
  

module.exports = { getByCustomerId };
