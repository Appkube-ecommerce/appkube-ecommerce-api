const axios = require('axios');
require('dotenv').config();

module.exports.sendCatalogMessage = async (toNumber, whatsappToken) => {
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
              "type": "catalog_message",
              "body": {
                "text": "Hello! Thanks for your interest. Ordering is easy. Just visit our catalog and add items to purchase."
              },
              "action": {
                "name": "catalog_message",
                "parameters": {
                  "thumbnail_product_retailer_id": "1171481066386"
                }
              },
              "footer": {
                "text": "Best grocery deals on WhatsApp!"
              }
            }
          };
 
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            data: JSON.stringify(addressMessageData), // Convert to JSON string
            redirect: 'follow',
        };
 
        const response = await axios.post("https://graph.facebook.com/v19.0/208582795666783/messages/", JSON.stringify(addressMessageData), requestOptions);
        const result = response.data;
        console.log(result);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};
 
 
 
 
 
module.exports.sendPaymentLinkButton = async (toNumber, whatsappToken,url) => {
    try {
        const myHeaders = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + whatsappToken
        };
 
        const sendPaymentLinkButtonData = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": toNumber,
            "type": "interactive",
            "interactive": {
                "type": "cta_url",
                "body": {
                    "text": "Tap the button below to complete order payment."
                },
                "action": {
                    "name": "cta_url",
                    "parameters": {
                        "display_text": "Pay with UPI",
                        "url": url
                    }
                }
            }
        };
 
        const requestOptions = {
            headers: myHeaders,
        };
 
        const response = await axios.post("https://graph.facebook.com/v19.0/208582795666783/messages", sendPaymentLinkButtonData, requestOptions);
        const result = response.data;
        console.log(result);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};