const axios = require('axios');
const {client} = require('./db')


async function sendAddressMessageWithSavedAddresses(toNumber, whatsappToken, userDetails) {
    try {
    
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
        await client.connect();
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
 async function storeUserResponse(phone_number_id, message) {
    try {
        // Connect to the database
       await client.connect();

        // Check if the user already exists in the database
        const existingRecord = await client.query('SELECT phone_number FROM users WHERE phone_number = $1', [phone_number_id]);

        if (existingRecord.rows.length === 0) {
            // Insert a new record if the user doesn't exist
            await client.query('INSERT INTO users(phone_number, details) VALUES($1, $2)', [phone_number_id, message]);
        } else {
            // Update existing record with user's new response
            await client.query('UPDATE users SET details = $1 WHERE phone_number = $2', [message, phone_number_id]);
        }

        // Release the database connection
        client.release();
    } catch (error) {
        console.error('Error storing user response:', error);
        throw error;
    }
};
module.exports = {
    sendAddressMessageWithSavedAddresses,
    getUserAddressFromDatabase,
    storeUserResponse
};