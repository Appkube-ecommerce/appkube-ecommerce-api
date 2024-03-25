const AWS = require('aws-sdk');
const crypto = require('crypto');
 
 
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
    try {
        const { email, password, userType } = JSON.parse(event.body);

        if (!email || !password || !userType) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required parameters' })
            };
        }

        let params;
        if (userType === 'superAdmin') {
            params = {
                AuthFlow: 'ADMIN_NO_SRP_AUTH',
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                ClientId: process.env.COGNITO_CLIENT_ID,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password,
                    SECRET_HASH: calculateSecretHash(email)
                }
            };
        } else if (userType === 'admin' || userType === 'user') {
            params = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                ClientId: process.env.COGNITO_CLIENT_ID,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password
                }
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid user type' })
            };
        }

        const response = await cognito.adminInitiateAuth(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Success', token: response.AuthenticationResult.IdToken })
        };
    } catch (error) {
        console.error('Error:', error);
        const message = error.message ? error.message : 'Internal server error';
        return {
            statusCode: 500,
            body: JSON.stringify({ message })
        };
    }
};

const calculateSecretHash = (username) => {
    const { COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET } = process.env;
    const data = username + COGNITO_CLIENT_ID;
    return crypto
        .createHmac('sha256', COGNITO_CLIENT_SECRET)
        .update(data, 'utf8')
        .digest('base64');
};
