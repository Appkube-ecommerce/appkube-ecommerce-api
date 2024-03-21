const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

module.exports.createInventoryTable = async () => {
    const createTableParams = {
        TableName: 'Inventory',
        KeySchema: [
            { AttributeName: 'inventoryId', KeyType: 'HASH' }  // Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: 'inventoryId', AttributeType: 'S' }  // S denotes string type
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };

    const createTableCommand = new CreateTableCommand(createTableParams);

    try {
        const data = await dynamoDB.send(createTableCommand);
        console.log('Table created successfully:', data);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Table created successfully' })
        };
    } catch (error) {
        console.error('Error creating table:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to create table', error: error.message })
        };
    }
};
