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
  let headersSent = false;
  try {
    const response = await fetch("https://proxy.tune.app/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.TUNE_KEY,
      },
      body: JSON.stringify({
        temperature: 0.5, 
        messages: [
          {
            "role": "user",
            "content": req.body.message || ""
          }
        ],
        model: "taimurshaikh/sera-chat",
        stream: true,
        "frequency_penalty": 0.2,
        "max_tokens": 100
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!headersSent) {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked'
      });
      headersSent = true;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      console.log(lines);
      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const jsonData = JSON.parse(line.slice(5));
            if (jsonData.choices && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
              res.write(jsonData.choices[0].delta.content);
            }
          } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            // Skip this line and continue with the next one
            continue;
          }
        }
      }
    }

    if (!res.writableEnded) {
      res.end();
    }
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
  try {
    const response = await fetch("https://proxy.tune.app/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "sk-tune-55WZEcq50hGTI7L4NXP86FBeTNpnhBve3Nn",
      },
      body: JSON.stringify({
        temperature: 0.5, 
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
            "content": req.body.message || ""
          }
        ],
        model: "taimurshaikh/sera-cerebras-ocr",
        stream: false,
        "frequency_penalty":  0.2,
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

/**
 * GET /api/ai/test
 * Test route to verify the TUNE_KEY environment variable.
 */
router.get('/test', (req, res) => {
  res.send(process.env.TUNE_KEY);
});

export default router;