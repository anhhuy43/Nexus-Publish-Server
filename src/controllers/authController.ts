import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import dotenv from 'dotenv';
import { generateToken } from '../utils/jwt';
import admin from '../config/firebase';

dotenv.config();

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

export const register = async (req: express.Request, res: express.Response) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    res.status(400).json({ message: 'Please provide email, name, and password' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Please provide email and password' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    if (!user.password) {
      res.status(401).json({ message: 'Invalid email or password (no local password set)' });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const googleLogin = async (req: express.Request, res: express.Response) => {
  const { idToken } = req.body;
  console.log('🚀 ~ googleLogin ~ idToken:', idToken);

  if (!idToken) {
    res.status(400).json({ message: 'Google ID token is required' });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('🚀 ~ googleLogin ~ decodedToken:', decodedToken);
    const { email, name, uid } = decodedToken;

    if (!email) {
      res.status(400).json({ message: 'Google account must have an email associated.' });
      return;
    }

    let user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email,
          name: name || 'Google User',
          googleId: uid,
        },
      });
    } else {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            googleId: uid,
          },
        });
      }
    }

    const appToken = generateToken({
      userId: user.id,
      email: user.email,
    });

    console.log('🍪 Setting cookie with token:', appToken.substring(0, 20) + '...');

    res.cookie('token', appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });

    console.log('🍪 Cookie set successfully');

    res.status(200).json({
      message: 'Google login successful',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Error logging in with Google:', error);
    if (error instanceof Error && error.message.includes('auth/id-token-expired')) {
      res.status(401).json({ message: 'Google ID token expired' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = (req: express.Request, res: express.Response) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
};
