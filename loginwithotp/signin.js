

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cognito = new AWS.CognitoIdentityServiceProvider();

function generateTokens(mno) {
    // Generate token payload with user information

    const payload = {
        // Include user attributes as needed
        phone_number:mno
    };

    // Generate access token
    const accessToken = jwt.sign(payload, process.env.COGNITO_CLIENT_SECRET, { expiresIn: '15m' });

    // Generate ID token
    const idToken = jwt.sign(payload, process.env.COGNITO_CLIENT_ID, { expiresIn: '1h' });

    return {
        accessToken: accessToken,
        idToken: idToken
    };
}

module.exports.signInWithOTP = async (event) => {
    const { mobileNumber, otp } = JSON.parse(event.body);

    try {
        // Retrieve user attributes from Cognito
        const params = {
                        UserPoolId: process.env.COGNITO_USER_POOL_ID,
                        Username: mobileNumber
                    };
                    console.log("&&&&&&&&&&&&",mobileNumber+"^^^^^^^^^^^^"+params)
                    const user = await cognito.adminGetUser(params).promise();
                    console.log("**user**", user)
                    const storedOTP = user.UserAttributes.find(attr => attr.Name === 'custom:otp').Value;
                    const storedPhoneNumber=user.UserAttributes.find(attr => attr.Name === 'phone_number').Value
                    const { COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET } = process.env;
                    console.log("**storedotp", storedOTP)
                    console.log("**storedPhoneNumber", storedPhoneNumber)
                    console.log("**mobileNumber", mobileNumber)
                    console.log("**mobileNumber", otp)
        

        if (storedOTP === otp && storedPhoneNumber === mobileNumber) {
            // Generate tokens or return user attributes
       
            const tokens = generateTokens(storedPhoneNumber);
            console.log("tokenssssss",tokens)

      const decodedToken = jwt.decode(tokens.idToken);
      console.log("###########",decodedToken)
            
            return { statusCode: 200, body: JSON.stringify({ message: 'Success', token: tokens }) }
        } else {
            // Authentication failed
            return {
                authenticated: false,
                message: 'Invalid credentials'
            };
        }
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        return {
            authenticated: false,
            message: 'Error authenticating user'
        };
    }
};
