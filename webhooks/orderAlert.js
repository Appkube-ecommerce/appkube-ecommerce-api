
const { client } = require('./db')

// Function to retrieve the incomplete order alert flag from the sessions table
async function getIncompleteOrderAlertSent(senderId) {
    try {

        // Query the database to retrieve the flag
        const result = await client.query('SELECT session_data->>\'incompleteOrderAlertSent\' AS flag FROM sessions WHERE sender_id = $1', [senderId]);
        // Release the client back to the pool
        client.release();
        // If a row exists, return the flag value; otherwise, return false
        return result.rows.length > 0 ? result.rows[0].flag : false;
    } catch (error) {
        console.error('Error retrieving incomplete order alert flag:', error);
        throw error;
    }
}

// Function to update the incomplete order alert flag in the sessions table
async function setIncompleteOrderAlertSent(senderId, value) {
    try {
        // Query the database to update the flag
        await client.query('UPDATE sessions SET session_data = jsonb_set(session_data, \'{"incompleteOrderAlertSent"}\', $1) WHERE sender_id = $2', [value, senderId]);
        // Release the client back to the pool
        client.release();
    } catch (error) {
        console.error('Error updating incomplete order alert flag:', error);
        throw error;
    }
}

// Inside the switch statement:
module.exports = { getIncompleteOrderAlertSent, setIncompleteOrderAlertSent };
