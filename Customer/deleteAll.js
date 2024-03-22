const { DynamoDBClient, ScanCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { fromIni } = require('@aws-sdk/credential-provider-ini');
require('dotenv').config();

// Create DynamoDB client
const dynamoDB = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.ENDPOINT
});

// Delete all customers function
const deleteAllCustomers = async () => {
    try {
        // Define the params for the Scan operation to retrieve all items
        const scanParams = {
            TableName: 'Customer' // Change table name to 'Customer'
        };

        // Perform the Scan operation to retrieve all items
        const data = await dynamoDB.send(new ScanCommand(scanParams));

        // Extract the customer IDs from the retrieved items
        const customerIds = data.Items.map(item => item.customerId.S);

        // Delete each item by its ID
        const deletePromises = customerIds.map(customerId => {
            const params = {
                TableName: 'Customer', // Change table name to 'Customer'
                Key: {
                    'customerId': { S: customerId } // Change attribute name to 'customerId'
                }
            };
            return dynamoDB.send(new DeleteItemCommand(params));
        });

        // Wait for all delete operations to complete
        await Promise.all(deletePromises);

        // Return success response
        return { message: 'All customers deleted successfully' };
    } catch (error) {
        console.error('Error deleting all customers:', error);
        throw new Error('Failed to delete all customers');
    }
};

module.exports = deleteAllCustomers;
