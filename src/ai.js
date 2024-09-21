import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

/**
 * POST /api/ai/chat
 * Handles chat requests using the Tune API.
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
        stream: false,
        "frequency_penalty": 0.2,
        "max_tokens": 100
      })
    });

    const data = await response.json();
    console.log(data);
    res.json(data);
  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' + error });
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