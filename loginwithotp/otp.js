const AWS = require('aws-sdk');
const crypto = require('crypto');
require('dotenv').config();

const cognito = new AWS.CognitoIdentityServiceProvider();
const sns = new AWS.SNS();

const generateOTP = () => {
    // Generate a 6-digit random OTP
    return Math.floor(100000 + Math.random() * 900000);
};

const sendOTP = async (mobileNumber, otp) => {
    // Send OTP to user's mobile number via SMS using Amazon SNS
    const params = {
        Message: `Your OTP for login: ${otp}`,
        PhoneNumber: mobileNumber
    };
    await sns.publish(params).promise();
};

const associateOTPWithUser = async (mobileNumber, otp) => {
    // Store the OTP in a secure manner, such as in a database or as an attribute in the user's profile in Cognito
    // Here, we'll use a custom attribute in Cognito user pool
    console.log("@@@",mobileNumber)
    console.log("&&&",otp)
    console.log("$$$$",process.env.COGNITO_USER_POOL_ID)
    const params = {
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: mobileNumber,
        UserAttributes: [
            {
                Name: 'custom:otp',
                Value: otp.toString()
            }
        ]
    };
    await cognito.adminUpdateUserAttributes(params).promise();
};

module.exports.generateAndSendOTP = async (event) => {
    try {
        const { mobileNumber } = JSON.parse(event.body);
        const otp = generateOTP();
        console.log("####",otp)
      //  await sendOTP(mobileNumber, otp);
        await associateOTPWithUser(mobileNumber, otp);
        return { statusCode: 200, body: JSON.stringify({ message: 'OTP generated and sent successfully',otp:otp }) };
    } catch (error) {
        console.error('Error generating and sending OTP:', error);
        return { statusCode: 500, body: JSON.stringify({ message: 'Error generating and sending OTP', error: error }) };
    }
};

// module.exports.signInWithOTP = async (event) => {
//     try {
//         const { mobileNumber, otp } = JSON.parse(event.body);
//         // Retrieve the OTP associated with the user from the secure storage
//         const params = {
//             UserPoolId: process.env.COGNITO_USER_POOL_ID,
//             Username: mobileNumber
//         };
//         const user = await cognito.adminGetUser(params).promise();
//         const storedOTP = user.UserAttributes.find(attr => attr.Name === 'custom:otp').Value;

//         // Validate the provided OTP
//         if (otp === storedOTP) {
//             return { statusCode: 200, body: JSON.stringify({ message: 'OTP verified successfully' }) };
//         } else {
//             return { statusCode: 400, body: JSON.stringify({ message: 'Invalid OTP' }) };
//         }
//     } catch (error) {
//         console.error('Error verifying OTP:', error);
//         return { statusCode: 500, body: JSON.stringify({ message: 'Error verifying OTP', error: error }) };
//     }
// };
