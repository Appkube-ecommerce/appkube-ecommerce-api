exports.categoriedeletebyid = async (event) => {

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
  
        const result = await client.query('DELETE FROM categories WHERE category_id = $1 RETURNING *', [categoryId]);

        if (result.rowCount === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Category not found' }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Category deleted successfully' }),
        };
    } catch (error) {
        console.error('Error deleting category by ID:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    } finally {
        await client.end();
    }
};
