const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummyAccessKeyId',
    secretAccessKey: 'dummySecretAccessKey',
  },
});

async function getOrderById(event) {
  try {
    // Extract the id from path parameters
    const id = event.pathParameters.id;
    console.log('Fetching item with ID:', id);

    // Ensure that id is not undefined or empty
    if (!id) {
      console.error('Invalid ID:', id);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid ID' }),
      };
    }

    // Define parameters for retrieving the item from DynamoDB
    const params = {
      TableName: 'Order',
      Key: {
        'id': { N: id.toString() },
    },
    };

    // Retrieve the item from DynamoDB
    const data = await client.send(new GetItemCommand(params));
    console.log('Retrieved item:', data.Item);

    // Check if the item exists
    if (!data.Item) {
      console.error('Item not found with ID:', id);
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

module.exports = { getOrderById };
