
require('dotenv').config();
const AWS = require('aws-sdk');
const crypto = require('crypto');

//AWS.config.update({ region: process.env.AWS_REGION });

const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
    try {
        console.log("Received Event:", event);

        const requestBody = JSON.parse(event.body);
        console.log("Request Body:", requestBody);

        const { email, password } = requestBody;
        const clientId = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_SECRET;

        if (!email || !password) {
            throw new Error("Missing required parameters.");
        }

        const secretHash = calculateSecretHash(clientId, clientSecret, email);

        const params = {
            AuthFlow: "USER_PASSWORD_AUTH", // Use USER_PASSWORD_AUTH flow instead
            ClientId: clientId,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
                SECRET_HASH: secretHash
            }
        };

        const authResult = await cognito.initiateAuth(params).promise();
        console.log("Authentication Result:", authResult);

        // Extract the JWT token from the authentication result
        //const accessToken = authResult.AuthenticationResult.AccessToken;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Login success", accessToken: authResult })
        };
    } catch (error) {
        console.error("Error logging in user:", error);
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify({ message: 'Error logging in user', error: error })
        };
    }
};

const calculateSecretHash = (clientId, clientSecret, username) => {
    const hmac = crypto.createHmac('sha256', clientSecret);
    hmac.update(username + clientId);
    return hmac.digest('base64');
};
