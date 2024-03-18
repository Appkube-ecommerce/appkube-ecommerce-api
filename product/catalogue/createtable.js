// const AWS = require('aws-sdk');
 
// // Configure the AWS SDK to use DynamoDB Local
// AWS.config.update({
//   region: 'localhost',
//   endpoint: 'http://localhost:8000'
// });
 
// // Create a DynamoDB service object
// const dynamoDb = new AWS.DynamoDB();
 
// // Define the table schema
// const params = {
//   TableName: 'ProductsTabl',
//   KeySchema: [
//     { AttributeName: 'productId', KeyType: 'HASH' }  // Partition key
//   ],
//   AttributeDefinitions: [
//     { AttributeName: 'productId', AttributeType: 'S' }  // productId is a string
//     // Add more attribute definitions if needed
//   ],
//   ProvisionedThroughput: {
//     ReadCapacityUnits: 5,
//     WriteCapacityUnits: 5
//   }
// };
 
// // Create the DynamoDB table
// dynamoDb.createTable(params, (err, data) => {
//   if (err) {
//     console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
//   } else {
//     console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
//   }
// });


const AWS = require('aws-sdk');

// Configure the AWS SDK to use DynamoDB Local
AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'fakeAccessKeyId', // Dummy access key ID
  secretAccessKey: 'fakeSecretAccessKey', // Dummy secret access key
});

// Create a DynamoDB service object
const dynamoDb = new AWS.DynamoDB();

// Define the table schema
const params = {
  TableName: 'ProductsTable',
  KeySchema: [
    { AttributeName: 'productId', KeyType: 'HASH' }  // Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: 'productId', AttributeType: 'S' }  // productId is a string
    // Add more attribute definitions if needed
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

// Create the DynamoDB table
dynamoDb.createTable(params, (err, data) => {
  if (err) {
    console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
  } else {
    console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
  }
});
