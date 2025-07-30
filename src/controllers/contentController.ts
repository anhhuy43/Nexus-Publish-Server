import express from 'express';
import prisma from '../prisma';

export const createContent = async (req: express.Request, res: express.Response) => {
  const { title, body } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({
      message: 'User ID not found in token',
    });
    return;
  }

  try {
    if (!title || !body) {
      res.status(400).json({
        message: 'Title and body are required',
      });
      return;
    }

    const newContent = await prisma.content.create({
      data: {
        title,
        body,
        status: 'draft',
        userId: userId as number,
      },
      select: {
        id: true,
        title: true,
        body: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      message: 'Content created successfully',
      content: newContent,
    });
    return;
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
