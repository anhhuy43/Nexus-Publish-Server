import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface JwtPayLoad {
  userId: number;
  email: string;
}

export const generateToken = (payload: JwtPayLoad): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token: string): JwtPayLoad | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayLoad;
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};
