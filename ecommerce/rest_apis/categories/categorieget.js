exports.categorieget = async (event) => {

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

        const result = await client.query('SELECT * FROM categories');

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows),
        };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    } finally {
        await client.end();
    }
};
