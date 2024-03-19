exports.categorieinsert = async (event) => {

    const { name } = JSON.parse(event.body);

    require('dotenv').config();
    const { Client } = require('pg');

    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    try {
        await client.connect();

        if (!name) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' }),
            };
        }
        const result = await client.query('INSERT INTO categories(name) VALUES ($1) RETURNING *', [name]);

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows[0]),
        };
    } catch (error) {
        console.error('Error creating categories:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    } finally {
        await client.end();
    }
};
