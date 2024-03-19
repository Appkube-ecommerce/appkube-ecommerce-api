const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000'
});
module.exports.updateProduct = async (event) => {
  try {
    const { id } = event.pathParameters;
    const { name, description, price, quantity, unit, category, image } = JSON.parse(event.body);
    const params = {
      TableName: 'products',
      Key: {
        productId: String(id),
      },
      UpdateExpression: 'SET #name = :name, #description = :description, #price = :price, #quantity = :quantity, #unit = :unit, #category = :category, #image = :image',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#description': 'description',
        '#price': 'price',
        '#quantity': 'quantity',
        '#unit': 'unit',
        '#category': 'category',
        '#image': 'image',
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':description': description,
        ':price': price,
        ':quantity': quantity,
        ':unit': unit,
        ':category': category,
        ':image': image,
      },
      ReturnValues: 'ALL_NEW',
    };
    const data = await dynamodb.update(params).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Product updated successfully', updatedProduct: data.Attributes })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not update product' })
    };
  }  };