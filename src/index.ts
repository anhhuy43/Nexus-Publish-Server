import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import prisma from './prisma';
import route from './routes';

dotenv.config();

const app = express();
app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true,
  }),
);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

route(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export {};
