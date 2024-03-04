// const AWS = require('aws-sdk');
// const dotenv = require('dotenv');
// const crypto = require('crypto');

// dotenv.config();

// const cognito = new AWS.CognitoIdentityServiceProvider({ region: process.env.AWS_REGION });

// exports.handler = async (event) => {
//     try {
//         console.log("Received Event:", event);

//         const requestBody = JSON.parse(event.body);
//         console.log("Request Body:", requestBody);

//         const { email, password, groupName } = requestBody;

//         if (!email || !password || !groupName) {
//             throw new Error("Missing required parameters.");
//         }

//         const userPoolId = process.env.COGNITO_USER_POOL_ID;
//         const clientId = process.env.COGNITO_CLIENT_ID;
//         const clientSecret = process.env.COGNITO_CLIENT_SECRET;

//         // Step 1: Register User
//         const newUser = await registerUser(email, password, userPoolId, clientId, clientSecret);

//         // Step 2: Add User to Group
//         await addUserToGroup(newUser.Username, userPoolId, groupName, clientId, clientSecret);

//         return sendResponse(200, { message: "User registered and added to group successfully." });
//     } catch (error) {
//         console.error("Error:", error);
//         return sendResponse(error.statusCode || 500, { message: error.message });
//     }
// };

// const calculateSecretHash = (username, clientId, clientSecret) => {
//     if (!username || !clientId || !clientSecret) {
//         throw new Error("Missing required parameters for calculating secret hash.");
//     }

//     const data = username + clientId;
//     return crypto
//         .createHmac('sha256', clientSecret)
//         .update(data, 'utf8')
//         .digest('base64');
// };

// const registerUser = async (email, password, userPoolId, clientId, clientSecret) => {
//     const secretHash = calculateSecretHash(email, clientId, clientSecret);

//     const params = {
//         ClientId: clientId,
//         Username: email,
//         Password: password,
//         UserAttributes: [
//             { Name: 'email', Value: email },
//             { Name: 'email_verified', Value: 'true' } // Assuming email is verified
//         ],
//         SecretHash: secretHash
//     };

//     return await cognito.signUp(params).promise();
// };

// const addUserToGroup = async (username, userPoolId, groupName, clientId, clientSecret) => {
//     const secretHash = calculateSecretHash(username, clientId, clientSecret);

//     const params = {
//         UserPoolId: userPoolId,
//         Username: username,
//         GroupName: groupName,
//         SecretHash: secretHash
//     };

//     await cognito.adminAddUserToGroup(params).promise();
// };

// const sendResponse = (statusCode, body) => {
//     const response = {
//         statusCode: statusCode,
//         body: JSON.stringify(body),
//         headers: {
//             'Content-Type': 'application/json',
//             'Access-Control-Allow-Origin': '*',
//             'Access-Control-Allow-Credentials': true
//         }
//     };
//     return response;
// };

// const AWS = require('aws-sdk');
// const dotenv = require('dotenv');
// const crypto = require('crypto');

//dotenv.config();

//const cognito = new AWS.CognitoIdentityServiceProvider({ region: process.env.AWS_REGION });

const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const cognito = new AWS.CognitoIdentityServiceProvider({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    try {
        console.log("Received Event:", event);

        const requestBody = JSON.parse(event.body);
        console.log("Request Body:", requestBody);

        const { email, password, userType } = requestBody;

        if (!email || !password || !userType) {
            throw new Error("Missing required parameters.");
        }

        const userPoolId = process.env.COGNITO_USER_POOL_ID;
        const clientId = process.env.COGNITO_CLIENT_ID;
        const clientSecret = process.env.COGNITO_CLIENT_SECRET;

        // Step 1: Register User
        console.log("Registering user...");
        const newUser = await registerUser(email, password, userPoolId, clientId, clientSecret, userType);
        console.log("User registered:", newUser);

        return sendResponse(200, { message: "User registered successfully." });
    } catch (error) {
        console.error("Error:", error);
        return sendResponse(error.statusCode || 500, { message: error.message });
    }
};

const calculateSecretHash = (username, clientId, clientSecret) => {
    const data = username + clientId;
    return crypto
        .createHmac('sha256', clientSecret)
        .update(data, 'utf8')
        .digest('base64');
};

const registerUser = async (email, password, userPoolId, clientId, clientSecret, userType) => {
    const userAttributes = [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' }, // Assuming email is verified
        // Include other standard attributes as needed
    ];

    // Include additional attributes based on user type (admin or regular user)
    if (userType === 'admin') {
        userAttributes.push({ Name: 'userType', Value: 'admin' });
        // Include other admin-specific attributes
    } else {
        userAttributes.push({ Name: 'userType', Value: 'regular' });
        // Include other regular user-specific attributes
    }

    const params = {
        ClientId: clientId,
        Username: email,
        Password: password,
        UserAttributes: userAttributes,
        SecretHash: calculateSecretHash(email, clientId, clientSecret)
    };

    return await cognito.signUp(params).promise();
};

const sendResponse = (statusCode, body) => {
    const response = {
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        }
    };
    return response;
};
