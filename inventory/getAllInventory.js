// const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();
const AWS = require('aws-sdk');


const dynamoDB = new AWS.DynamoDB.DocumentClient();


module.exports.getAllInventory = async (event) => {
    try {
        // Define the params for the Scan operation
        const params = {
            TableName: 'Inventory-hxojpgz675cmbad5uyoeynwh54-dev'
        };


        // Perform the Scan operation to get all inventory items
        const data = await dynamoDB.scan(params).promise();
        console.log(data)
        // Return the list of inventory items
        return {
            statusCode: 200,
            body: JSON.stringify(data.Items),
        };
    } catch (error) {
        console.error('Error getting all inventory items:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to get all inventory items', error: error.message }),
        };
    }
};
