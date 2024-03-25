const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

const dynamoDbClient = new DynamoDBClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
});

exports.createTable = async () => {
  try {
    const params = {
      TableName: 'Order',
      KeySchema: [
        { AttributeName: 'orderId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'orderId', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    };

    const command = new CreateTableCommand(params);
    await dynamoDbClient.send(command);
    console.log('Table created successfully.');
  } catch (err) {
    console.error('Error creating table:', err);
  }
};

exports.handler = async () => {
  await exports.createTable();
};
