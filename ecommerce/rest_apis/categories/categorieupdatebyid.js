exports.categorieupdatebyid = async (event) => {


    const requestBody = JSON.parse(event.body);

    const { name} = requestBody;

    const categoryId = event.pathParameters.id;

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

        const result = await client.query('UPDATE categories SET name = $1 WHERE category_id = $2 RETURNING *', [name, categoryId]);

        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Category not found' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows[0]),
        };
    } catch (error) {
        console.error('Error updating category by ID:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    } finally {
        await client.end();
    }
};
