const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

exports.registerUser = async (event) => {
    try {
        const requestBody = JSON.parse(event.body);
        const { username, password, role } = requestBody;

        // Validate email format
        if (!isValidEmail(username)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid email format' })
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Register user in Cognito User Pool
        const params = {
            ClientId: 'YOUR_COGNITO_APP_CLIENT_ID',
            Username: username,
            Password: hashedPassword,
            UserAttributes: [
                {
                    Name: 'custom:role',
                    Value: role // Assign role to user
                }
            ]
        };

        await cognitoIdentityServiceProvider.signUp(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User registered successfully' })
        };
    } catch (error) {
        console.error('Error registering user:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error registering user', error: error.message })
        };
    }
};

// Helper function to validate email format
function isValidEmail(email) {
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}




/*{
  "access_token": "EAAMgtQusqZCEBO9loHZCAeJBWc2QbQm4GO8tqk3OPh2hxFQLy3ToY8NVeNpixmP7kxQQCWBeZCgMghAPrTUAUVHRPS62vkLz1tomzn09JnfLJiRMzQ9yIvgtLXMICOKx4VZCeY0IDKIjcWqAZBvZCa0DrTxG7Vr2SVkOKWQwl9YRSWCR9yaY2dlEFgjtcKZC8LG",
  "requests": [
    {
      "method": "CREATE",
      "retailer_id": "retailer-274772",
      "data": {
        "availability": "out of stock",
        "brand": "Nike",
        "category": "t-shirts",
        "description": "product description",
        "image_url": "http://www.images.example.com/t-shirts/1.png",
        "name": "product name",
        "price": 10,
        "currency": "USD",
        "shipping": [
           {
              "country": "US",
              "region": "CA",
              "service": "service",
              "price_value": 10,
              "price_currency": "USD"
           }
        ],
         "condition": "new",
         "url": "http://www.images.example.com/t-shirts/1.png",
         "retailer_product_group_id": "product-group-1"
      },
      "applinks": {
          "android": [{
              "app_name": "Electronic Example Android",
              "package": "com.electronic",
              "url": "example-android://electronic"
              }],
          "ios": [{
              "app_name": "Electronic Example iOS",
              "app_store_id": 2222,
              "url": "example-ios://electronic"
              }]
      }
    }
  ]
}*/

