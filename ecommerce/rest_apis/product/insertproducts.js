const AWS = require('aws-sdk');
const uuid = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummyAccessKeyId',
    secretAccessKey: 'dummySecretAccessKey',
  },
});
module.exports.insertProducts = async (event) => {
  try {
    const { name, description, price, quantity, unit, category, image } = JSON.parse(event.body);
    const productId = uuid.v4(); 
    const params = {
      TableName: 'products',
      Item: {
        productId: productId,
        name: name,
        description: description,
        price: price,
        quantity: quantity,
        unit: unit,
        category: category,
        image: image
      }
    };
    await dynamodb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Product added successfully', productId: productId })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not add product' })
    };
  }
};