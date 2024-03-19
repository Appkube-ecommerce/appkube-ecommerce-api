const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000'
});
module.exports.deleteProduct = async (event) => {
  const { id } = event.pathParameters;

  try {
    const params = {
      TableName: 'products',
      Key: {
        productId: String(id),
      },
    };
    await dynamodb.delete(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Product deleted successfully' })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not delete product' })
    };
  }  };