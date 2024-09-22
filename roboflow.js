import axios from 'axios';
import fs from 'fs';
import sharp from 'sharp';

// Use environment variables for sensitive information
const API_KEY = process.env.ROBOFLOW_API_KEY;
const IMAGE_PATH = process.env.IMAGE_PATH || './receipt.jpg';

export const runOCR = async () => {
    try {
        // Load and process the image
        const imageBuffer = await sharp(IMAGE_PATH)
            .resize({ width: 800 }) // Resize if necessary
            .toBuffer();

        // Convert image to base64
        const base64Image = imageBuffer.toString('base64');

        // Prepare data for OCR request
        const data = {
            image: {
                type: 'base64',
                value: base64Image
            }
        };

        // Make a request to the OCR endpoint
        const ocrResponse = await axios.post(
            `https://infer.roboflow.com/doctr/ocr?api_key=${API_KEY}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `API-Key ${API_KEY}`
                }
            }
        );

        // Extract text from the response using backend API
        const extractedText = await axios.post('http://localhost:3001/api/ai/ocr-extraction', { ocrResponse: ocrResponse.data });

        // Instead of logging, return the results
        return {
            ocrResponse: ocrResponse.data,
            extractedText: extractedText.data
        };

    } catch (error) {
        console.error('Error during OCR:', error.response ? error.response.data : error.message);
        throw error; // Re-throw the error to be caught in server.js
    }
};
