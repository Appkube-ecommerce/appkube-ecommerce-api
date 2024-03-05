const AWS = require('aws-sdk');
 
// Set up local DynamoDB configuration
const dynamoDbConfig = {
  region: 'localhost',
  endpoint: 'http://localhost:8000'
};
 
// Create DynamoDB service object
const dynamodb = new AWS.DynamoDB(dynamoDbConfig);
 
// Define table schema
const params = {
  TableName: 'Orderss',
  KeySchema: [
    { AttributeName: 'orderId', KeyType: 'HASH' }  // Partition key
  ],
 
  AttributeDefinitions: [
    { AttributeName: 'orderId', AttributeType: 'S' }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};
 
// Create the table
dynamodb.createTable(params, (err, data) => {
  if (err) {
    console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
  } else {
    console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
  }
});