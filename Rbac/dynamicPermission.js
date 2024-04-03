const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS
AWS.config.update({
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
});
// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
module.exports.fetchDynamicGroups = async (event) => {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    try {
        const dynamicGroupPermissions = {};

        const { group, permissions } = JSON.parse(event.body);

        if (group === 'admin' || group === 'user') {
            try {
                const existingPermissions = await getPermissionsFromDatabase(group);

                const updatedPermissions = existingPermissions.concat(permissions);

                await updatePermissionsInDatabase(group, updatedPermissions);

                dynamicGroupPermissions[group] = updatedPermissions;
            } catch (error) {
                console.error(`Error updating permissions for group ${group} in the database:`, error);
                throw error;
            }
        }

        return dynamicGroupPermissions;
    } catch (error) {
        console.error('Error fetching groups from user pool:', error);
        throw error;
    }
}

// Function to fetch permissions from the database for a specific group
async function getPermissionsFromDatabase(group) {
    const params = {
        TableName: 'PermissionsTable', // Adjust table name as per your DynamoDB configuration
        KeyConditionExpression: 'groupname = :group',
        ExpressionAttributeValues: {
            ':group': group
        }
    };

    try {
        const data = await dynamoDB.query(params).promise();
        const nestedArray = data.Items.map(item => item.permissions);
      
        const flattenedArray = nestedArray.flat(Infinity);
        return flattenedArray || [];
    } catch (error) {
        console.error(`Error fetching permissions for group ${group} from the database:`, error);
        throw error;
    }
}

// Function to update or insert permissions in the database for a specific group
async function updatePermissionsInDatabase(group, permissions) {
    const params = {
        TableName: 'PermissionsTable', // Adjust table name as per your DynamoDB configuration
        Item: {
            'groupname': group,
            'permissions': permissions
        }
    };

    try {
        await dynamoDB.put(params).promise();
    } catch (error) {
        console.error(`Error updating permissions for group ${group} in the database:`, error);
        throw error;
    }
}
