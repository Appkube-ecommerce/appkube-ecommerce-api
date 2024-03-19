const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000'
});
module.exports.getbyidproduct = async (event) => {
  const { id } = event.pathParameters;

  try {
    const params = {
      TableName: 'products',
      Key: {
        productId: id
      }  };
    const data = await dynamodb.get(params).promise();

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Product not found' })
      };
    } return {
      statusCode: 200,
      body: JSON.stringify(data.Item)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not get product' })
    };
  }
};
