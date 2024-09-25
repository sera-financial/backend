import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const router = express.Router();
router.use(cors(
    {
        origin: '*',
        credentials: true,
    }
));

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
        messages:  [
          {
            "role": "system",
            "content": `Return just the JSON and nothing else. Classify the vendors under categories. The categories are: Food, Gas, Groceries, Restaurants, Shopping, Transportation, Utilities, Other. If the vendor is not in the list, you will return ["Other"].`
          },
          {
            "role": "user",
            "content": req.body.messages.join(",")
          }
        ],
        model: "taimurshaikh/sera-merchant-classification",
        stream: false,
     //   "frequency_penalty": 0.2,
        "max_tokens": 100
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