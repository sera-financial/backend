import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from "openai";



const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

dotenv.config();

const router = express.Router();
router.use(cors(
    {
        origin: '*',
        credentials: true,
    }
));


router.post('/read', async (req, res) => {
 // console.log("I am using the parsing your output you give me in an API. Please classify this transaction." + req.body.message)
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `I am using the parsing your output you give me in an API. Output must be in JSON format. Output Example:{"category": "category of the transaction"}. Do not send anything other than JSON, be  direct and concise. You can output one of these categories: Food, Bills, Entertainment, Shopping, Travel, Other. Don't include markdown. Please categorize this transaction: ` + req.body.message
      }
    ]
  });

  console.log(JSON.parse(response.choices[0].message.content))
  res.status(200).json(JSON.parse(response.choices[0].message.content))
});

/**
 * POST /api/ai/chat
 * Handles streaming chat requests using the Tune API.
 */
router.post('/chat', async (req, res) => {
  try {
    const response = await fetch("https://proxy.tune.app/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.TUNE_KEY,
      },
      body: JSON.stringify({
        temperature: 0.3, 
        messages: [
          {
            "role": "user",
            "content": req.body.message || ""
          }
        ],
        model: "taimurshaikh/sera-chat",
        stream: false,
        "frequency_penalty": 0.2,
        "max_tokens": 100
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // return the message
    const data = await response.json();
    res.json(JSON.parse(data.choices[0].message.content));
  } catch (error) {
    console.error('Error in chat route:', error);
    if (!headersSent) {
      res.status(500).json({ error: 'An error occurred while processing your request: ' + error.message });
    }
  }
});

/**
 * POST /api/ai/ocr-extraction
 * Handles OCR extraction requests using the Tune API.
 */
router.post('/ocr-extraction', async (req, res) => {
  console.log(req.body);
  try {
    const response = await fetch("https://proxy.tune.app/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.TUNE_KEY,
      },
      body: JSON.stringify({
        temperature: 0.1, 
        messages:  [
          {
            "role": "system",
            "content": `You are an extractive AI system who's only purpose is to extract transaction information from OCR scraped text from a receipt. Do not hallucinate any information if you are unsure. You must return a json output if the format:
{
  "vendor": The name of the vendor being paid to
  "amount": The dollar amount of the transaction
  "datetime": String format of the date and time of the transaction.
}
If the input is not extractable, return {} and terminate.`
          },
          {
            "role": "user",
            "content": req.body.ocrResponse.result || ""
          }
        ],
        model: "taimurshaikh/sera-cerebras-ocr",
        stream: false,
        //"frequency_penalty":  0.2,
        "max_tokens": 900
      })
    });


    const data = await response.json();
    console.log(data);
    res.json(data);
  } catch (error) {
    console.error('Error in ocr extraction route:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

router.post('/merchant-classification', async (req, res) => {
  console.log(req.body);
  try {
    const response = await fetch("https://proxy.tune.app/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.TUNE_KEY,
      }, 
      body: JSON.stringify({
        temperature: 0.1, 
        messages: [
          {
            "role": "system",
            "content": `Please parse the user's input and return a JSON array of transactions. Each transaction should be an object with the following fields:
        - "type": A string indicating the category (e.g., "Food").
        - "description": A string describing the transaction.
        - "amount": A number representing the amount.
        - "date": A string in "YYYY-MM-DD" format representing the date.
        
        Example output:
        
        [
          {
            "type": "Food",
            "description": "This is a description of the transaction",
            "amount": 20,
            "date": "2024-02-01"
          }
        ]
        
        Please process the input accordingly and return the JSON array in the specified format.`
          },
          {
            "role": "user",
            "content": req.body.messages
          }
        ],
        
        model: "taimurshaikh/sera-merchant-classification",
        stream: false,
     //   "frequency_penalty": 0.2,
        "max_tokens": 1000000,
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error in merchant classification route:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

/**
 * GET /api/ai/test
 * Test route to verify the TUNE_KEY environment variable.
 */
router.get('/test', (req, res) => {
  res.send(process.env.TUNE_KEY);
});

export default router;