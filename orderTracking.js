const AWS = require('aws-sdk');

AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.getOrderTracking = async (event) => {
    try {
      const { orderId } = event.pathParameters;
   
      const params = {
        TableName: 'order', // Updated table name
        Key: { order_Id: orderId } // Corrected Key parameter
      };
   
      const { Item } = await dynamoDb.get(params).promise();
   
      if (!Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Order not found' })
        };
      }
   
      const trackingInfo = {
        orderId,
        status: Item.status,
        estimatedDeliveryDate: new Date().toISOString() // Replace with your logic to calculate the estimated delivery date
      };
   
      return {
        statusCode: 200,
        body: JSON.stringify(trackingInfo)
      };
    } catch (error) {
      console.error('Error getting order tracking information:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to get order tracking information' })
      };
    }
};
