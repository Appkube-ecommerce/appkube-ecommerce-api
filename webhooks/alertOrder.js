const { client, connectToDatabase } = require("./db");

async function getIncompleteOrderAlertSent(senderId) {
    try {
        // Ensure that the client is connected to the database
       

        // Use the client to query the database
        const result = await client.query('SELECT session_data->>\'incompleteOrderAlertSent\' AS flag FROM sessions WHERE sender_id = $1', [senderId]);

        // If a row exists, return the flag value; otherwise, return false
        return result.rows.length > 0 ? result.rows[0].flag : false;
    } catch (error) {
        console.error('Error retrieving incomplete order alert flag:', error);
        throw error;
    }
}






async function setIncompleteOrderAlertSent(senderId, value) {
    try {
        // Connect to the database
        // Query the database to update the flag
        await client.query('UPDATE sessions SET session_data = jsonb_set(session_data, \'{"incompleteOrderAlertSent"}\', $1) WHERE sender_id = $2', [value, senderId]);
        // Release the client back to the pool
        
    } catch (error) {
        console.error('Error updating incomplete order alert flag:', error);
        throw error;
    }
}

module.exports = {
    getIncompleteOrderAlertSent,
    setIncompleteOrderAlertSent,
}