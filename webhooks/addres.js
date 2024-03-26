const axios = require('axios');
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
 
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            data: JSON.stringify(addressMessageData), // Convert to JSON string
            redirect: 'follow',
        };
 
        const response = await axios.post("https://graph.facebook.com/v19.0//messages", JSON.stringify(addressMessageData), requestOptions);
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
 
        const response = await axios.post("https://graph.facebook.com/v19.0//messages", sendPaymentLinkButtonData, requestOptions);
        const result = response.data;
        console.log(result);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};

// Assuming this function is defined in createPaymentLink.js

// Mock implementation of createPaymentLink function
