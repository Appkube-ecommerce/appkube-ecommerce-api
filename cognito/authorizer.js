// Dynamic authorizer function
exports.dynamicAuthorizer = async (event) => {
    try {
  
     const token = event.headers.Authorization.split(' ')[1];
    
      
      console.log(token)
      
      const decodedToken = decode(token);
      console.log(decodedToken)
      
      if (decodedToken && decodedToken['cognito:groups']) {
        const groups = decodedToken['cognito:groups'];
        console.log(groups)
  
        
        const groupPermissions = {
          'user': ['/hello'],
          'admin': ['/inventory '],
         
        };
        console.log(event.resource)
        
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
  
      
      return generatePolicy('default', 'Deny', event.methodArn);
    } catch (error) {
      console.error('Error in authorizer:', error);
      return generatePolicy('default', 'Deny', event.methodArn);
    }
  };
  
  // Helper function to generate IAM policy
  const generatePolicy = (principalId, effect, resource) => {
    
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
  