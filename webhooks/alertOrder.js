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
        console.log('Updating incomplete order alert flag for sender:', senderId);
        console.log('New flag value:', value);
        const query = 'UPDATE sessions SET session_data = jsonb_set(session_data, \'{"incompleteOrderAlertSent"}\', $1::jsonb) WHERE sender_id = $2';
        await client.query(query, [{ incompleteOrderAlertSent: value }, senderId]);
        console.log('Incomplete order alert flag updated successfully.');
        // Release the client back to the pool
        // If necessary, handle any other cleanup or post-operation tasks
    } catch (error) {
        console.error('Error updating incomplete order alert flag:', error);
        throw error;
    }
}

async function getPreviousIncompleteOrder(senderId) {
    try {
        // Query the database to retrieve the incomplete order alert flag and cart items
        const result = await client.query('SELECT session_data->>\'incompleteOrderAlertSent\' AS flag, session_data->\'cart\' AS cart FROM sessions WHERE sender_id = $1', [senderId]);

        // Log the fetched data
        console.log('Fetched data:', result.rows);
        
        // Extract and return the incomplete order alert flag and cart items from the result
        if (result.rows.length > 0) {
            const flag = result.rows[0].flag === 'true'; // Convert flag to boolean
            const cart = result.rows[0].cart ? result.rows[0].cart.items : []; // Extract cart items or initialize with empty array
            return { flag, cart };
            
            
        } else {
            return { flag: false, cart: [] }; // No previous incomplete order alert found
        }
        
    } catch (error) {
        console.error('Error retrieving incomplete order alert flag and cart:', error);
        throw error;
    }
}
async function fetchPreviousOrderFromDatabase(senderId) {
    try {
      const query = {
        text: 'SELECT session_data -> \'cart\' AS cart FROM sessions WHERE sender_id = $1',
        values: [senderId],
      };
  
      const result = await client.query(query);
      // Extract and return the cart data
      return result.rows[0]?.cart;
    } catch (error) {
      console.error('Error fetching previous order from database:', error.message);
      return null;
    }
  }

module.exports = {
    getIncompleteOrderAlertSent,
    setIncompleteOrderAlertSent,
    getPreviousIncompleteOrder,
    fetchPreviousOrderFromDatabase
}