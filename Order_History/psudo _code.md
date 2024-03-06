### Order_History 

## OrderoPost -

1. Import necessary modules:
    - AWS SDK
    - uuid module for generating unique identifiers

2. Configure AWS SDK:
    - Set region to 'localhost'
    - Set endpoint to 'http://localhost:8000'
    - Set fake access key ID and secret access key for local testing

3. Create a DynamoDB DocumentClient instance.

4. Define the Lambda function handler for posting order data:
    1. Parse the incoming event body to extract the required data (order_details, customer_id,  product_details, totalprice, createdAt, status).
    2. Generate a unique order_id using UUIDv4.
    3. Prepare the parameters for putting an item into the DynamoDB table:
        - Specify the table name ('OrderHistory').
        - Define the attributes for the order item including the generated order_id.
    4. Put the item into DynamoDB using the prepared parameters.
    5. Await the response from the put operation.
    6. If successful, return a success response with a status code of 200 and a success message in the response body.
    7. If an error occurs during the process:
        - Log the error.
        - Return a failure response with a status code of 500 and an error message in the response body.

##  OrderGetAll -

1. Import necessary modules:
    - AWS SDK

2. Configure AWS SDK:
    - Set region to 'localhost'
    - Set endpoint to 'http://localhost:8000'
    - Set fake access key ID and secret access key for local testing

3. Create a DynamoDB DocumentClient instance.

4. Define the Lambda function handler for fetching all items from the "OrderHistory" table:
    1. Prepare the parameters for scanning all items in the DynamoDB table:
        - Specify the table name ('OrderHistory').
    2. Scan the DynamoDB table using the prepared parameters.
    3. Await the response from the scan operation.
    4. If successful, return a success response with a status code of 200 and the fetched items in the response body.
    5. If an error occurs during the process:
        - Log the error.
        - Return a failure response with a status code of 500 and an error message in the response body.

##  OrderGetById -

1. Import necessary modules:
    - AWS SDK

2. Configure AWS SDK:
    - Set region to 'localhost' (or update with your region if not using local DynamoDB)
    - Set endpoint to 'http://localhost:8000'
    - Set fake access key ID and secret access key for local testing

3. Create a DynamoDB DocumentClient instance.

4. Define the Lambda function handler for fetching an item by order_id:
    1. Extract the order_id from the path parameters of the event.
    2. Prepare the parameters for retrieving an item from the DynamoDB table:
        - Specify the table name ('OrderHistory').
        - Define the Key as the order_id to identify the item to be retrieved.
    3. Retrieve the item from DynamoDB using the prepared parameters.
    4. Await the response from the get operation.
    5. If the item is not found:
        - Return a response with a status code of 404 and a message indicating that the item was not found.
    6. If the item is found:
        - Return a success response with a status code of 200 and the retrieved item in the response body.
    7. If an error occurs during the process:
        - Log the error.
        - Return a failure response with a status code of 500 and an error message in the response body.



