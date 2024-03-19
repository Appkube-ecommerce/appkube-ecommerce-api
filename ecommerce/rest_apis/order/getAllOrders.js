const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000', // Adjust the port to match your local DynamoDB instance
  credentials: {
    accessKeyId: 'dummyAccessKeyId',
    secretAccessKey: 'dummySecretAccessKey',
  },
});

async function getAllOrders(req, res) {
  const params = {
    TableName: 'Order',
  };

  try {
    const data = await client.send(new ScanCommand(params));
    console.log('Items retrieved successfully:', data.Items);
    // Assuming you're using Serverless Offline, you can send the response back like this:
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    console.error('Error retrieving items:', error);
    // Assuming you're using Serverless Offline, you can send the error back like this:
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
}

module.exports = { getAllOrders };


