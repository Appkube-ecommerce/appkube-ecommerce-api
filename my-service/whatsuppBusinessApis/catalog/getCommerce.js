const axios = require('axios');

// Function to retrieve commerce settings for a specific business phone number
async function getCommerceSettings(phoneNumber, accessToken) {
  try {
    const endpoint = `https://graph.facebook.com/v17.0/${phoneNumber}/whatsapp_commerce_settings`;
    const response = await axios.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching commerce settings:', error.message);
    throw error;
  }
}
// Example usage
const phoneNumber = ''; // Replace with the desired phone number
const accessToken = ''; // Replace with your actual access token

getCommerceSettings(phoneNumber, accessToken)
  .then(commerceSettings => console.log('Commerce settings:', commerceSettings))
  .catch(error => console.error('Failed to retrieve commerce settings:', error.message));

module.exports = getCommerceSettings ;