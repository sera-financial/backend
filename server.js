import express from 'express';
import userRoutes from './src/user.js';
import budgetRoutes from './src/budget.js';
import aiRoutes from './src/ai.js';
import { dbConnect } from './src/app/lib/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import qrHandoffRoutes from './src/qrHandoff.js';
import fs from 'fs';
//import { runOCR } from './roboflow.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/qr-handoff', qrHandoffRoutes);
app.use(cors({
  origin: ['http://localhost:3000', 'http://10.251.129.22:3000', 'http://10.251.129.22:3001'],
  credentials: true,
}));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// New route for file upload and OCR processing
app.post('/upload/:id', upload.single('receipt'), async (req, res) => {
  const { id } = req.params;
  const { file } = req;

  if (file) {
    const filePath = path.join(process.cwd(), file.path);
    
    try {
      // Set the IMAGE_PATH environment variable for runOCR
      process.env.IMAGE_PATH = filePath;

      // Run OCR on the uploaded file
      const ocrResult = await runOCR();

      // Send the OCR result back to the client
      res.json({ success: true, ocrResult });
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ success: false, error: 'Error processing file' });
    }
  } else {
    res.status(400).json({ success: false, error: 'No file uploaded' });
  }
});

// Connect to the database
dbConnect();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});