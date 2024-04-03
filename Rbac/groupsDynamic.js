const AWS = require('aws-sdk');
require('dotenv').config();
// Initialize AWS SDK
const cognito = new AWS.CognitoIdentityServiceProvider();

// Function to fetch all groups from a specific user pool
module.exports.fetchDynamicGroups = async () => {
    const userPoolId = process.env.COGNITO_USER_POOL_ID; // Use environment variable for user pool ID
    try {
        
        const groups = await listGroups(userPoolId);
        
        return {
            statusCode: 200,
            body: JSON.stringify(groups)
        };
    } catch (error) {
        console.error('Error fetching groups from user pool:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error fetching groups' })
        };
    }
}

// Function to list groups within a user pool
async function listGroups(userPoolId) {
    try {
        const data = await cognito.listGroups({ UserPoolId: userPoolId }).promise();
        return data.Groups || [];
    } catch (error) {
        console.error('Error listing groups for user pool:', error);
        throw error;
    }
}

