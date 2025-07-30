import { Router } from 'express';
import { createContent } from '../controllers/contentController';
import { authToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/create', authToken, createContent);

export default router;
