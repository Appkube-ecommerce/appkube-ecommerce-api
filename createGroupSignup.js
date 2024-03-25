const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();
 

exports.handler = async (event) => {
    try {
        const { email, password } = JSON.parse(event.body);

        if (!email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required parameters' })
            };
        }

        // Create SuperAdmin user in Cognito
        await createSuperAdmin(email, password);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'SuperAdmin registered successfully' })
        };
    } catch (error) {
        console.error('Error registering SuperAdmin:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error registering SuperAdmin', error: error.message })
        };
    }
};

async function createSuperAdmin(email, password) {
    try {
        // Create the SuperAdmin user in Cognito
        const userParams = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: email,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email
                }
            ]
        };

        const createUserResponse = await cognito.adminCreateUser(userParams).promise();
        if (createUserResponse.User) {
            const paramsForSetPass = {
                Password: password,
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                Username: email,
                Permanent: true
            };

            await cognito.adminSetUserPassword(paramsForSetPass).promise();
        }

        // Check if the SuperAdmin group exists
        const groupParams = {
            GroupName: 'SuperAdmin',
            UserPoolId: process.env.COGNITO_USER_POOL_ID
        };
        try {
            await cognito.getGroup(groupParams).promise();
        } catch (error) {
            // If the group doesn't exist, create it
            if (error.code === 'ResourceNotFoundException') {
                await createSuperAdminGroup();
            } else {
                throw error;
            }
        }

        // Add the user to the SuperAdmin group
        await cognito.adminAddUserToGroup({
            GroupName: 'SuperAdmin',
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: email
        }).promise();
    } catch (error) {
        console.error('Error creating SuperAdmin user:', error);
        throw error;
    }
}

async function createSuperAdminGroup() {
    try {
        const params = {
            GroupName: 'SuperAdmin',
            UserPoolId: process.env.COGNITO_USER_POOL_ID
        };
        await cognito.createGroup(params).promise();
        console.log('SuperAdmin group created successfully');
    } catch (error) {
        console.error('Error creating SuperAdmin group:', error);
        throw error;
    }
}
