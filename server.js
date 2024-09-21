import express from 'express';
import userRoutes from './src/user.js';
import aiRoutes from './src/ai.js';
import { dbConnect } from './src/app/lib/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

const PORT = process.env.PORT || 3001;

dbConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to the database:', error);
});

app.get('/', (req, res) => {
  res.send('Hello World');
});