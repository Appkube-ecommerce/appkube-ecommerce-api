const { DynamoDBClient, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000', // Adjust the port to match your local DynamoDB instance
  credentials: {
    accessKeyId: 'dummyAccessKeyId',
    secretAccessKey: 'dummySecretAccessKey',
  },
});

async function deleteOrderById(event) {
  const orderId = event.pathParameters.id; // Extract orderId from path parameters

  const params = {
    TableName: 'Order',
    Key: {
      'id': { N: orderId.toString() }
    }
  };

  try {
    const data = await client.send(new DeleteItemCommand(params));
    console.log('Item deleted successfully:', data);
    return { 
      statusCode: 200, 
      body: JSON.stringify({ success: true, message: 'Item deleted successfully' })
    };
  } catch (error) {
    console.error('Error deleting item:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ success: false, message: 'Error deleting item' })
    };
  }
}

module.exports = { deleteOrderById };
