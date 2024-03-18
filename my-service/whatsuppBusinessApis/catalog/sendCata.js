const axios = require('axios');

async function sendCatalogMessage(toPhoneNumber, bodyText, thumbnailProductRetailerId, footerText, accessToken) {
  try {
    const endpoint = 'https://graph.facebook.com/v19.0/205920032613965/messages';
    const requestBody = {
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": toPhoneNumber,
      "type": "interactive",
      "interactive": {
        "type": "catalog_message",
        "body": {
          "text": bodyText
        },
        "action": {
          "name": "catalog_message",
          "parameters": {
            "thumbnail_product_retailer_id": thumbnailProductRetailerId
          }
        },
        "footer": {
          "text": footerText
        }
      }
    };

    const response = await axios.post(endpoint, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('Catalog message sent successfully:', response.data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      const errorMessage = error.response.data.error.message || 'Unknown error occurred';
      const errorDetails = error.response.data.error.error_data ? error.response.data.error.error_data.details : '';
      console.error(`Failed to send catalog message: ${errorMessage}. ${errorDetails}`);
    } else {
      console.error('Failed to send catalog message:', error.message);
    }
    throw error;
  }
}

// Example usage
const toPhoneNumber = ''; // Replace with the recipient's phone number
const bodyText = 'Hello! Thanks for your interest. Ordering is easy. Just visit our catalog and add items to purchase.';
const thumbnailProductRetailerId = 'retailer17482'; // Replace with the product's retailer ID
const footerText = 'Best grocery deals on WhatsApp!';
const accessToken = ''; // Replace with your actual access token

sendCatalogMessage(toPhoneNumber, bodyText, thumbnailProductRetailerId, footerText, accessToken)
  .then(() => console.log('Catalog message sent successfully'))
  .catch(error => console.error('Failed to send catalog message:', error.message));

module.exports = { sendCatalogMessage };
