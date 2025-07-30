import express from 'express';
import { verifyToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

export const authToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const decoded = verifyToken(token as string);

  if (!decoded) {
    res.clearCookie('token');
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  req.user = {
    id: decoded.userId,
    email: decoded.email,
  };

  next();
};
