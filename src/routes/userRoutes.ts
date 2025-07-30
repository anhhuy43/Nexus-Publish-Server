import { Router } from 'express';
import { getUserProfile } from '../controllers/userController';
import { authToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/profile', authToken, getUserProfile);

export default router;
