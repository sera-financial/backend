import express from 'express';
import userRoutes from './src/user.js';
import { dbConnect } from './src/app/lib/db.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3001;

dbConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to the database:', error);
});