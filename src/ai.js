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
        temperature: 0.9, 
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

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        res.write('data: [DONE]\n\n');
        break;
      }
      const chunk = decoder.decode(value);
      res.write(`data: ${chunk}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json({ error: 'An error occurred while processing your request: ' + error.message });
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
        "Authorization": process.env.TUNE_KEY,
      },
      body: JSON.stringify({
        temperature: 0.8, 
        messages:  [
          {
            "role": "user",
            "content": req.body.message || ""
          }
        ],
        model: "taimurshaikh/sera-ocr-extraction",
        stream: false,
        "frequency_penalty":  0,
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