const axios = require('axios');

async function sendButtons(toNumber, whatsappToken, options) {
    try {
        const messageData = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": toNumber,
            "type": "interactive",
            "interactive": options
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + whatsappToken
            },
            data: messageData,
            redirect: 'follow',
        };

        console.log("Sending buttons message to number:", toNumber);

        const response = await axios.post("https://graph.facebook.com/v19.0/208582795666783/messages", messageData, requestOptions);
        const result = response.data;

        console.log("Buttons message sent successfully:", result);

        return result;
    } catch (error) {
        console.error('Error sending buttons message:', error);
        throw error;
    }
}

module.exports = {
    sendButtons
};