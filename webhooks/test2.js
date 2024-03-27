const axios = require('axios');
const { Pool } = require('pg');
const express = require('express');
const app = express();

const pool  = new Pool({
    user: '',
    password: '',
    host: '', // e.g., 'localhost' or 'your_database.amazonaws.com'
    database: '',
    port: , // Default PostgreSQL port
});

// Function to send address message and await user's response
module.exports.getUserAddress = async (toNumber, whatsappToken) => {
    try {
        const myHeaders = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + whatsappToken
        };
 
        const addressMessageData = {
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
                        "country": "IN"
                    }
                }
            }
        };
 
        console.log("Sending address message to number:", toNumber); // Log the number before sending
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            data: addressMessageData,
            redirect: 'follow',
        };
 
        const response = await axios.post("https://graph.facebook.com/v19.0//messages", addressMessageData, requestOptions);
        const result = response.data;
        console.log("Address message sent successfully:", result); // Log the success after sending
        return result;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};

// Function to receive user's response from WhatsAp

// Function to store user's response in the database
module.exports.storeUserResponse = async (phone_number_id, message) => {
    try {
        // Connect to the database
        const client = await pool.connect();

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

 