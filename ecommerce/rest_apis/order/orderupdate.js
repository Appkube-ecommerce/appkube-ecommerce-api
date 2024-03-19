const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummyAccessKeyId',
    secretAccessKey: 'dummySecretAccessKey',
  },
});

async function updateOrderById(event) {
  const orderId = parseInt(event.pathParameters.id);
  const updateData = JSON.parse(event.body);

  // Check if updateData.products is an array
  if (!Array.isArray(updateData.products)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Products must be provided as an array' }),
    };
  }

  const params = {
    TableName: 'Order',
    Key: {
      'id': { N: orderId.toString() },
    },
    UpdateExpression: 'SET #products = :products, #totalPrice = :totalPrice, #createdAt = :createdAt',
    ExpressionAttributeNames: {
      '#products': 'products',
      '#totalPrice': 'totalPrice',
      '#createdAt': 'createdAt',
    },
    ExpressionAttributeValues: {
      ':products': { S: JSON.stringify(updateData.products) },
      ':totalPrice': { N: updateData.totalPrice.toString() },
      ':createdAt': { S: updateData.createdAt },
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const data = await client.send(new UpdateItemCommand(params));
    console.log('Item updated successfully:', data.Attributes);
    return {
      statusCode: 200,
      body: JSON.stringify(data.Attributes),
    };
  } catch (error) {
    console.error('Error updating item:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
}

module.exports = { updateOrderById };
