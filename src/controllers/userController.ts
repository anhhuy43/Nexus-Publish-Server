import express from 'express';
import prisma from '../prisma';

export const getUserProfile = async (req: express.Request, res: express.Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User ID not found in token' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        googleId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const userProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      googleId: user.googleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({ user: userProfile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
