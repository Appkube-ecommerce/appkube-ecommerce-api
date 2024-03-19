// Import the AWS SDK
const AWS = require('aws-sdk');

// Set the endpoint URL for DynamoDB Local
const endpoint = new AWS.Endpoint('http://localhost:8000');

// Set the region to 'localhost' for DynamoDB Local
AWS.config.update({
    region: 'localhost',
    endpoint
});

// Create an instance of the DynamoDB service
const dynamodb = new AWS.DynamoDB();

// Define the parameters for creating the table
const params = {
    TableName: 'inventory',
    KeySchema: [
        { AttributeName: 'inventory_id', KeyType: 'HASH' } // Partition key
    ],
    AttributeDefinitions: [
        { AttributeName: 'inventory_id', AttributeType: 'S' } // String (created_at)
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5, // Adjust the read capacity units as needed
        WriteCapacityUnits: 5 // Adjust the write capacity units as needed
    }
};

// Create the table
dynamodb.createTable(params, (err, data) => {
    if (err) {
        console.error('Unable to create table. Error:', JSON.stringify(err, null, 2));
    } else {
        console.log('Table created successfully:', JSON.stringify(data, null, 2));
    }
});
