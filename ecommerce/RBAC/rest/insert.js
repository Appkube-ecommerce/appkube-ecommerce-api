const { DynamoDBClient, PutItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummyAccessKeyId',
    secretAccessKey: 'dummySecretAccessKey',
  },
});

async function insertOrderItem(event) {
  try {
    const { products, totalPrice, createdAt, status, customerName, customer_id } = JSON.parse(event.body);

    // Parse totalPrice to a number
    const parsedTotalPrice = parseFloat(totalPrice);

    // Generate a unique short numeric ID with 2 or 3 digits
    const id = generateShortNumericId();

    const params = {
      TableName: 'Order',
      Item: {
        'id': { N: id.toString() }, // 'N' indicates a numeric attribute
        'customerName': { S: customerName }, // No need to stringify customerName
        'customer_id': { N: customer_id.toString() },
        'products': { S: JSON.stringify(products) },
        'totalPrice': { N: parsedTotalPrice.toString() },
        'createdAt': { S: createdAt },
        'status': { S: status }
      },
    };

    await client.send(new PutItemCommand(params));
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Order item inserted successfully', id }),
    };
  } catch (error) {
    console.error('Error inserting item:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

async function updateOrderStatus(event) {
  try {
    const { id } = event.pathParameters;
    const { status } = JSON.parse(event.body);

    const params = {
      TableName: 'Order',
      Key: {
        'id': { N: id.toString() },
      },
      UpdateExpression: 'SET #s = :s',
      ExpressionAttributeNames: {
        '#s': 'status',
      },
      ExpressionAttributeValues: {
        ':s': { S: status },
      },
    };

    await client.send(new UpdateItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Status of order ${id} updated to ${status}` }),
    };
  } catch (error) {
    console.error('Error updating item:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

// Function to generate a unique short numeric ID with 2 or 3 digits
function generateShortNumericId() {
  return Math.floor(Math.random() * 900 + 100); // Generates a random 3-digit number
}

module.exports = { insertOrderItem, updateOrderStatus };
