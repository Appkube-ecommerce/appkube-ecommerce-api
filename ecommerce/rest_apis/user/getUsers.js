require('dotenv').config();

async function getAllUsers(event) {
    console.log(event)
    const { Client } = require('pg');
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
        password: process.env.DB_PASSWORD
    });

    client.connect();

    try {
        // Perform the database operation to retrieve all users
        const query = 'SELECT * FROM users';
        const result = await client.query(query);


        const users = result.rows;

        switch (event.field) {
            case "getAllUsers":
                return users;
            default:
                throw new Error("Unknown field, unable to resolve " + event.field);
        }
         

        // Return the users in a format expected by GraphQL schema
       
    } catch (error) {
        console.error('Error retrieving all users:', error);
        return {
            errors: [
                {
                    message: 'Internal Server Error',
                    errorType: 'InternalServerError'
                }
            ]
        };
    }
}

module.exports = { getAllUsers };
