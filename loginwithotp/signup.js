
const AWS = require('aws-sdk');
const crypto = require('crypto');
require('dotenv').config();

const cognito = new AWS.CognitoIdentityServiceProvider();

const sendResponse = (statusCode, body) => {
    return {
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    };
};

module.exports.signUp = async (event) => {
    try {
        const { mobileNumber } = JSON.parse(event.body);
        try {
                        const getUserParams = {
                            UserPoolId: process.env.COGNITO_USER_POOL_ID,
                            Filter: `phone_number="${mobileNumber}"`
                        };
                        const existingUsers = await cognito.listUsers(getUserParams).promise();
                        if (existingUsers.Users.length > 0) {
                            return sendResponse(400, { message: 'User already exists' });
                        }
                    } catch (getUserError) {
                        console.error('Error checking existing user:', getUserError);
                        throw getUserError;
                    }
        
        // Create the user in Cognito
        const userParams = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: `user_${crypto.randomBytes(4).toString('hex')}`,
            UserAttributes: [
                {
                    Name: 'phone_number',
                    Value: mobileNumber
                },
                {
                    Name: 'phone_number_verified',
                    Value: 'true'
                }
            ],
            MessageAction: 'SUPPRESS'
        };
        const createUserResponse = await cognito.adminCreateUser(userParams).promise();
        console.log('User created:', createUserResponse);

        return sendResponse(200, { message: 'Registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        return sendResponse(500, { message: 'Error registering user', error: error });
    }
};



// const AWS = require('aws-sdk');
// const crypto = require('crypto');
// require('dotenv').config();

// const cognito = new AWS.CognitoIdentityServiceProvider();

// const sendResponse = (statusCode, body) => {
//     return {
//         statusCode: statusCode,
//         body: JSON.stringify(body),
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     };
// };

// module.exports.signUp = async (event) => {
//     try {
//         const { mobileNumber } = JSON.parse(event.body);
        
//         // Check if the user already exists
//         try {
//             const getUserParams = {
//                 UserPoolId: process.env.COGNITO_USER_POOL_ID,
//                 Filter: `phone_number="${mobileNumber}"`
//             };
//             const existingUsers = await cognito.listUsers(getUserParams).promise();
//             if (existingUsers.Users.length > 0) {
//                 return sendResponse(400, { message: 'User already exists' });
//             }
//         } catch (getUserError) {
//             console.error('Error checking existing user:', getUserError);
//             throw getUserError;
//         }
        
//         // Create the user in Cognito
//         const userParams = {
//             UserPoolId: process.env.COGNITO_USER_POOL_ID,
//             Username: `user_${crypto.randomBytes(4).toString('hex')}`,
//             UserAttributes: [
//                 {
//                     Name: 'phone_number',
//                     Value: mobileNumber
//                 }
//             ],
//             MessageAction: 'SUPPRESS'
//         };
//         const createUserResponse = await cognito.adminCreateUser(userParams).promise();
//         console.log('User created:', createUserResponse);

//         const Params = {
//             UserPoolId: process.env.COGNITO_USER_POOL_ID,
//             Username: `user_${crypto.randomBytes(4).toString('hex')}`,
//             UserAttributes: [
//                 {
//                     Name: 'phone_number',
//                     Value: mobileNumber
//                 }
//             ],
         
//         };
        
//         await cognito.adminUpdateUserAttributes(Params).promise();
//         return { statusCode: 200, body: JSON.stringify({ message: 'successfully' }) };

//     } catch (error) {
//         console.error('Error registering user:', error);
//         return { statusCode: 500, body: JSON.stringify({ message: 'Error registering user' }) };

//     }
// };





