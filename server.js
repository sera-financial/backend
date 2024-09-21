import express from 'express';
import userRoutes from './src/user.js';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});