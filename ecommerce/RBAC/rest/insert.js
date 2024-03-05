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
  const { products, totalPrice, createdAt, status, customerName  } = JSON.parse(event.body);

  // Parse totalPrice to a number
  const parsedTotalPrice = parseFloat(totalPrice);

  const id = generateShortNumericId(); // Generate a unique short numeric ID for the order

  const params = {
    TableName: 'Order',
    Item: {
      'id': { N: id.toString() }, // 'N' indicates a numeric attribute
      'customerName': { S: JSON.stringify(customerName) },
      'products': { S: JSON.stringify(products) },
      'totalPrice': { N: parsedTotalPrice.toString() },
      'createdAt': { S: createdAt },
      'status': { S: status } // Adding the status to the order item
    },
  };

  try {
    await client.send(new PutItemCommand(params));
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Order item inserted successfully', id }),
      user: event.requestContext.authorizer.claims['cognito:username'],
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
    const { id } = event.pathParameters; // Extract id from path parameters
    const { status } = JSON.parse(event.body);

    const params = {
      TableName: 'Order',
      Key: {
        'id': { N: id.toString() }, // 'N' indicates a numeric attribute
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
  // Generate a random number within a specific range (e.g., between 10 and 999)
  return Math.floor(Math.random() * (999 - 10 + 1)) + 10;
}


module.exports = { insertOrderItem, updateOrderStatus };
