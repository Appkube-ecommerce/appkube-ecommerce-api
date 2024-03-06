
// // Dynamic authorizer function
// exports.dynamicAuthorizer = async (event) => {
//   try {
   
//     const token = 'eyJraWQiOiJEb01SbzFxS0I2dkRoVnEya1NMRmVwXC93XC9nNzEwcFwvUVdkcmpwRGtkaGxnPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1N2MxOWE0ZS00MzU4LTRmNWUtOGQzMS0yMzQ2OWIxM2JjNWEiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfV2l4TklsakRIIiwiY29nbml0bzp1c2VybmFtZSI6IjU3YzE5YTRlLTQzNTgtNGY1ZS04ZDMxLTIzNDY5YjEzYmM1YSIsIm9yaWdpbl9qdGkiOiI2NmI3YzhlMy0wYjliLTQxNTgtOGI4ZS04ZGRiYWY5YWZhMzMiLCJhdWQiOiI3dGduYnBvaXA0aDg2YXF2NTVybGJsNzY1MSIsImV2ZW50X2lkIjoiZWMzNmNkMTQtM2Q2OS00ZGU1LWFkYzItZjdlMDQ5M2QzZGU5IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MDk3MDU5ODIsImV4cCI6MTcwOTcwOTU4MiwiaWF0IjoxNzA5NzA1OTgyLCJqdGkiOiJmNDM5NTdjMS1iYmU5LTQ0MTgtODc1Yi1kZDE0MTExOTExYTMiLCJlbWFpbCI6Inh5ekBnbWFpbC5jb20ifQ.NDIUY5itis1WLZTnZJw90ayCFjJHNhFiUn4RwdeT2DH95-3QrjOOUCSdbjStaLhdESZ6FAolpqmt2IM0K2mqpNHsRJrY2NSGtbHssAJ01ABZIVEyKEHvH5B8KS0SRKSlNMQVrNtFmXmHGxDDbX6WrHYmSTu0-2F-Lrz-6a24bmJOoN1xIlLsmCnQgOwIvsSfHX9KKXYbeYGP-LbcooBlP61BWhfhSZyIXPLjVEKXFz3Fb0NIr2cyJDatTY8kx8y11MQ3IrOrOMowfFwc18u2VxukKjeCWA9KawMLBHerwqD4FFLWXGTYyfup_3-WKkxMjgXD82FNnCJauc2qFBBEYw'//event.headers.Authorization.split(' ')[1];
//      console.log(token)
//     // Decode the JWT token to get the Cognito user claims
//     const decodedToken = decode(token);
//     console.log("@@@",decodedToken)
//     // Check if the required claims are present
//     if (decodedToken && decodedToken['cognito:groups']) {
//       const groups = decodedToken['cognito:groups'];
//       console.log(groups)
 
//       // Define a mapping of groups to allowed resources
//       const groupPermissions = {
//         'user': ['/hello'],
//         'admin': ['/inventory'],
//         // Add more groups and their allowed resources as needed
//       };
//       console.log(event.resource)
//       // Check if user is in any allowed group
//       for (const group in groupPermissions) {
//         if (groups.includes(group)) {
//           const allowedResources = groupPermissions[group];
//             console.log(allowedResources)
//           if (allowedResources.includes(event.resource)) {
//             return generatePolicy(group, 'Allow', event.methodArn);
//           }
//         }
//       }
//     }
 
//     // Return a default "Deny" policy if no matching group/resource is found
//     return generatePolicy('default', 'Deny', event.methodArn);
//   } catch (error) {
//     console.error('Error in authorizer:', error);
//     return generatePolicy('default', 'Deny', event.methodArn);
//   }
// };
 
// // Helper function to generate IAM policy
// const generatePolicy = (principalId, effect, resource) => {
//   // console.log(principalId)
//   // console.log(effect)
//   // console.log(resource)
//   return {
//     principalId,
//     policyDocument: {
//       Version: '2012-10-17',
//       Statement: [
//         {
//           Action: 'execute-api:Invoke',
//           Effect: effect,
//           Resource: resource,
//         },
//       ],
//     },
//   };
// };
 
// // Helper function to decode JWT token
// const decode = (token) => {
//   const base64Url = token.split('.')[1];
//   const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//   const decoded = Buffer.from(base64, 'base64').toString('utf-8');
//   return JSON.parse(decoded);
// };
 


// Dynamic authorizer function
exports.dynamicAuthorizer = async (event) => {
  try {
    // console.log(event);
 console.log("@@@@@@@",event.authorizationToken.split(' ')[1])
    // Extract the JWT token from the Authorization header
   const token=event.authorizationToken.split(' ')[1]
    //const token = event.headers.Authorization.split(' ')[1];
     //console.log(token)
    // Decode the JWT token to get the Cognito user claims
    const decodedToken = decode(token);
    console.log("@@@", decodedToken)
    // Check if the required claims are present
    if (decodedToken && decodedToken['cognito:groups']) {
      const groups = decodedToken['cognito:groups'];
      console.log(groups)
 
      // Define a mapping of groups to allowed resources
      const groupPermissions = {
        'user': ['/getOrder/{id}', '/getAllOrder'],
        'admin': ['/inventory','/inventory/{inventory_id}'
      ],
        // Add more groups and their allowed resources as needed
      };
      console.log(event.resource)
      // Check if user is in any allowed group
      for (const group in groupPermissions) {
        if (groups.includes(group)) {
          const allowedResources = groupPermissions[group];
            console.log(allowedResources)
          if (allowedResources.includes(event.resource)) {
            return generatePolicy(group, 'Allow', event.methodArn);
          }
        }
      }
    }
 
    // Return a default "Deny" policy if no matching group/resource is found
    return generatePolicy('default', 'Deny', event.methodArn);
  } catch (error) {
    console.error('Error in authorizer:', error);
    return generatePolicy('default', 'Deny', event.methodArn);
  }
};
 
// Helper function to generate IAM policy
const generatePolicy = (principalId, effect, resource) => {
  // console.log(principalId)
  // console.log(effect)
  // console.log(resource)
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};
 
// Helper function to decode JWT token
const decode = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = Buffer.from(base64, 'base64').toString('utf-8');
  return JSON.parse(decoded);
};
