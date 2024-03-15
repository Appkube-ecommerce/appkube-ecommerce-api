const axios = require('axios');

// Facebook Business API endpoint for adding items to a catalogue
const FACEBOOK_API_URL = 'https://graph.facebook.com/v19.0//batch';

// Handler function to add an item to the catalogue
exports.addItemToCatalogue = async (event, context) => {
  try {
    // Extract item data from the request event
    const itemData = JSON.parse(event.body);

    // Make a POST request to the Facebook Business API to add the item
    const response = await axios.post(FACEBOOK_API_URL, itemData, {
      params: {
        access_token: ''
      }
    });

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    // Handle errors
    console.error('Error adding item to catalogue:', error);

    // Return error response
    return {
      statusCode: error.response.status || 500,
      body: JSON.stringify({
        error: 'Failed to add item to catalogue'
      })
    };
  }
};
