const axios = require('axios');
const { Pool } = require('pg');

// Configure PostgreSQL connection pool with your database credentials
const pool = new Pool({
    user: '',
    password: '',
    host: '', // e.g., 'localhost' or 'your_database.amazonaws.com'
    database: '',
    port: , // Default PostgreSQL 
})

async function sendAddressMessageWithSavedAddresses(toNumber, whatsappToken, userDetails) {
    try {
        // if (!userDetails || !userDetails.name) {
        //     throw new Error('Invalid user address details');
        // }

        // Construct message data with saved address details

const messageData = {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": toNumber,
    "type": "interactive",
    "interactive": {
        "type": "address_message",
        "body": {
            "text": "Thanks for your order! Tell us what address you’d like this order delivered to."
        },
        "action": {
            "name": "address_message",
            "parameters": {
                "country": "IN",
                "saved_addresses": [
                    {
                        "id": "address1",
                        "value": {
                            // Log user details inside the value object
                            ...console.log("****User details:", userDetails.values),
                            "name": userDetails.values.name,
                            "phone_number": userDetails.values.phone_number,
                            "in_pin_code": userDetails.values.in_pin_code,
                            "floor_number": userDetails.values.floor_number,
                            "building_name": userDetails.values.building_name,
                            "address": userDetails.values.address,
                            "landmark_area": userDetails.values.landmark_area,
                            "city": userDetails.values.city
                        }
                    }
                ]
            }
        }
    }
};


        

        // Set up headers for the HTTP request
        const myHeaders = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + whatsappToken
        };

        // Set up request options
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            data: messageData,
            redirect: 'follow',
        };

        console.log("Sending address message with saved addresses to number:", toNumber);

        // Send the address message with saved addresses
        const response = await axios.post("https://graph.facebook.com/v19.0//messages", messageData, requestOptions);
        const result = response.data;

        console.log("Address message with saved addresses sent successfully:", result);

        return result;
    } catch (error) {
        console.error('Error sending address message with saved addresses:', error);
        throw error;
    }
}

async function getUserAddressFromDatabase(senderId) {
    try {
        // Query to fetch user address details from the database based on senderId
        const query = {
            text: 'SELECT * FROM users WHERE phone_number = $1',
            values: [senderId],
        };

        // Connect to the database and execute the query
        const client = await pool.connect();
        const { rows } = await client.query(query);
        client.release();

        if (rows.length === 0) {
            return null; // User not found in the database
        }

        // Extract user address details from the database row
        const useruserDetails = rows[0].details;
        return useruserDetails;
    } catch (error) {
        console.error('Error fetching user address details from the database:', error);
        throw error;
    }
}
module.exports = {
    sendAddressMessageWithSavedAddresses,
    getUserAddressFromDatabase,
};