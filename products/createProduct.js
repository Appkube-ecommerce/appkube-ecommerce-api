const axios = require('axios');
require('dotenv').config();
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();


const FACEBOOK_GRAPH_API_URL = process.env.FACEBOOK_GRAPH_API_URL;
const CATALOG_ID = process.env.CATALOG_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;


function generateUniqueId() {
    return Math.floor(Math.random() * Date.now()).toString();
}

module.exports.handler = async (event) => {
    try {


        const tableName = 'Product-hxojpgz675cmbad5uyoeynwh54-dev';

        const productData = JSON.parse(event.body);


        const s3params = {
            Bucket: 'posdmsservice',
            Key: productData.name + productData.category,
            Body: Buffer.from(productData.image, 'base64'),
            ContentType: 'image/png'
        };


        const uploadResult = await s3.upload(s3params).promise();
        const publicUrl = uploadResult.Location;


        const newProduct = {
            id: generateUniqueId(),
            name: productData.name,
            price: productData.price,
            image: publicUrl,
            description: productData.description,
            unit: productData.unit,
            category: productData.category,

            createdAt: new Date().toISOString(),
            _version: 1,
            _lastChangedAt: Date.now(),
            _deleted: false,
            updatedAt: new Date().toISOString(),
        };
        try {
            const response = await axios.post(`${FACEBOOK_GRAPH_API_URL}/${CATALOG_ID}/products?access_token=${ACCESS_TOKEN}`, {
                retailer_id: newProduct.id,
                availability: productData.availability,
                brand: productData.brand,
                category: newProduct.category,
                description: newProduct.description,
                image_url: newProduct.image,
                name: newProduct.name,
                price: newProduct.price,
                currency: productData.currency,
                url: newProduct.image
            });
            console.log(response.body)

            const putParams = {
                TableName: tableName,
                Item: newProduct,
            };

            await dynamoDB.put(putParams).promise();

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Product created successfully', newProduct }),
            };
        } catch (error) {
            console.error('Failed to create product in Facebook catalog:', error.response.data);
            throw new Error(`Failed to create product in Facebook catalog: ${error.message}`);
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to create product', error: error.message }),
        };
    }
};