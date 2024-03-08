const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express().use(bodyParser.json());

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Webhook is listening on port', port);
});

app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const verifyToken = req.query["hub.verify_token"];

    if (mode && token) {
        if (mode === "subscribe" && token === mytoken) {
            res.status(200).send(challenge);
        } else {
            res.status(400).send("Incorrect verify token");
        }
    } else {
        res.sendStatus(400);
    }
});

app.post("/webhook", (req, res) => {
    const body_param = req.body;
    console.log(JSON.stringify(body_param, null, 2));

    if (body_param.object === "whatsapp_business_account") {
        const entry = body_param.entry;
        if (entry && entry[0].changes) {
            const changes = entry[0].changes;
            const message = changes[0].value.message[0];
            
            const phone_number_id = changes[0].value.metadata.phone_number_id;
            const from = message.from;
            const text = message.text.body;
            
            axios({
                method: "POST",
                url: "https://graph.facebook.com/v18.0/" + phone_number_id + "/messages?access_token=" + token,
                data: {
                    messaging_product: "whatsapp",
                    to: from,
                    message: {
                        text: "Hi, this is Mohammad Aslam"
                    }
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                console.log(response.data);
                res.sendStatus(200);
            }).catch(error => {
                console.error(error);
                res.sendStatus(500);
            });
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(400);
    }
});
