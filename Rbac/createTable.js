const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({
  region: 'localhost',
  endpoint: 'http://localhost:8000' // DynamoDB Local endpoint
});
 
const params = {
  TableName: 'PermissionsTable',
  KeySchema: [
    { AttributeName: 'groupname', KeyType: 'HASH' } // Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: 'groupname', AttributeType: 'S' } // 'S' denotes string type
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};
 
dynamodb.createTable(params, (err, data) => {
  if (err) {
    console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
  } else {
    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
  }
});
 