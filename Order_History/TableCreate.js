const AWS = require('aws-sdk');
 
const endpoint = new AWS.Endpoint('http://localhost:8000');
 

AWS.config.update({
    region: 'localhost',
    endpoint
});
 
const dynamodb = new AWS.DynamoDB();
 
const params = {
    TableName: 'OrderHistory', 
    KeySchema: [
        { AttributeName: 'OrderHistory_id', KeyType: 'HASH' } 
    ],
    AttributeDefinitions: [
        { AttributeName: 'OrderHistory_id', AttributeType: 'S' } 
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5, 
        WriteCapacityUnits: 5
    }
};
 

dynamodb.createTable(params, (err, data) => {
    if (err) {
        console.error('Unable to create table. Error:', JSON.stringify(err, null, 2));
    } else {
        console.log('Table created successfully:', JSON.stringify(data, null, 2));
    }
});
 