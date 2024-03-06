const AWS = require('aws-sdk');

const cognito = new AWS.CognitoIdentityServiceProvider();
require('dotenv').config();

exports.handler = async (event) => {
    const { email, password, role } = JSON.parse(event.body);
    const username = email; // Set the email as the username
    console.log("###########")
    console.log("@@",process.env.USER_POOL_ID)
    try {
        // Create the user in Cognito
        const userParams = {
            UserPoolId: process.env.USER_POOL_ID,
            Username: username,
            TemporaryPassword: password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email
                }
            ]
        };
      console.log(userParams)
        const createUserResponse = await cognito.adminCreateUser(userParams).promise();
        console.log(createUserResponse)

        // Assign role to the user
        const groupParams = {
            GroupName: role,
            UserPoolId: process.env.USER_POOL_ID,
            Username: username
        };
        await cognito.adminAddUserToGroup(groupParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User registered successfully', user: createUserResponse.User })
        };
    } catch (error) {
        console.error('Error registering user:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error registering user', error: error })
        };
    }
};
