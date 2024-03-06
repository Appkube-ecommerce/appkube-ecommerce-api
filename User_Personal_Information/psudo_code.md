### User_Personal_Information 

## Post -

1. Import necessary modules:
    - AWS SDK
    - uuid module for generating unique identifiers

2. Configure AWS SDK:
    - Set region to 'localhost'
    - Set endpoint to 'http://localhost:8000'
    - Set fake access key ID and secret access key for local testing

3. Create a DynamoDB DocumentClient instance.

4. Define the Lambda function handler for the POST operation:
    1. Parse the incoming event body to extract the required data (customer_email, personal_details).
    2. Generate a unique user_id using UUIDv4.
    3. Prepare the parameters for putting an item into the DynamoDB table:
        - Specify the table name ('USER') and the item to be inserted.
    4. Put the item into DynamoDB using the put operation.
    5. If successful, return a success response with a status code of 200 and a message.
    6. If an error occurs during the process:
        - Log the error.
        - Return a failure response with a status code of 500 and an error message.


## GetByAll -

1. Import necessary modules:
    - AWS SDK

2. Configure AWS SDK:
    - Set region to 'localhost'
    - Set endpoint to 'http://localhost:8000'
    - Set fake access key ID and secret access key for local testing

3. Create a DynamoDB DocumentClient instance.

4. Define the Lambda function handler for fetching all items:
    1. Prepare the parameters for scanning all items in the DynamoDB table:
        - Specify the table name ('USER').
    2. Scan the DynamoDB table using the prepared parameters.
    3. Await the response from the scan operation.
    4. If successful, return a success response with a status code of 200 and the fetched items in the response body.
    5. If an error occurs during the process:
        - Log the error.
        - Return a failure response with a status code of 500 and an error message.

##  UpdateById -

1. Import necessary modules:
    - AWS SDK
    - uuid module for generating unique identifiers

2. Configure AWS SDK:
    - Set region to 'localhost'
    - Set endpoint to 'http://localhost:8000'
    - Set fake access key ID and secret access key for local testing

3. Create a DynamoDB DocumentClient instance.

4. Define the Lambda function handler for updating an item by ID:
    1. Parse the incoming event body to extract the required data (customer_email, personal_details).
    2. Extract the user_id from the path parameters of the event.
    3. Prepare the parameters for updating an item in the DynamoDB table:
        - Specify the table name ('USER').
        - Define the Key as the user_id to identify the item to be updated.
        - Set the UpdateExpression to specify the attributes to be updated.
        - Provide ExpressionAttributeValues to map placeholders in the UpdateExpression to actual values.
        - Set ReturnValues to 'ALL_NEW' to return the updated item after the update operation.
    4. Update the item in DynamoDB using the prepared parameters.
    5. Await the response from the update operation.
    6. If successful, return a success response with a status code of 200 and the updated item in the response body.
    7. If an error occurs during the process:
        - Log the error.
        - Return a failure response with a status code of 500 and an error message.
