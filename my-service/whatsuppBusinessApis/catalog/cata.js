const axios = require('axios');

// Function to enable/disable product catalog for a specific business phone number
async function toggleProductCatalog(phoneNumber, isCatalogVisible, accessToken) {
  try {
    const endpoint = `https://graph.facebook.com/v19.0/${phoneNumber}/whatsapp_commerce_settings`;
    const response = await axios.post(endpoint, { is_catalog_visible: isCatalogVisible }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error toggling product catalog:', error.message);
    throw error;
  }
}

// Example usage
const phoneNumber = ''; // Replace with the desired phone number
const isCatalogVisible = true; // Set to true to enable, false to disable
const accessToken = ''; // Replace with your actual access token

toggleProductCatalog(phoneNumber, isCatalogVisible, accessToken)
  .then(() => console.log('Product catalog visibility toggled successfully'))
  .catch(error => console.error('Failed to toggle product catalog visibility:', error.message));

  module.exports = { toggleProductCatalog };