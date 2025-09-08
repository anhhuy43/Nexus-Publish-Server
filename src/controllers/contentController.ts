import express from 'express';
import prisma from '../prisma';
import { Prisma } from '@prisma/client';

// Define allowed content status
type ContentStatus = 'draft' | 'scheduled' | 'published';

// Interface for request body
interface CreateContentRequest {
  title: string;
  body: string;
  status?: ContentStatus;
}

export const createContent = async (req: express.Request, res: express.Response) => {
  const { title, body, status = 'draft' } = req.body as CreateContentRequest;
  const userId = req.user?.id;

  // Validate user authentication
  if (!userId) {
    res.status(401).json({
      message: 'Unauthorized: User ID not found in token',
    });
    return;
  }

  // Validate input
  if (!title || !body) {
    res.status(400).json({
      message: 'Title and body are required',
      errors: {
        title: !title ? 'Title is required' : null,
        body: !body ? 'Body is required' : null,
      },
    });
    return;
  }

  // Validate content length
  if (title.length < 3 || title.length > 255) {
    res.status(400).json({
      message: 'Invalid title length',
      error: 'Title must be between 3 and 255 characters',
    });
    return;
  }

  if (body.length < 10) {
    res.status(400).json({
      message: 'Invalid body length',
      error: 'Body must be at least 10 characters long',
    });
    return;
  }

  // Validate status
  const validStatuses: ContentStatus[] = ['draft', 'scheduled', 'published'];
  if (!validStatuses.includes(status as ContentStatus)) {
    res.status(400).json({
      message: 'Invalid status',
      error: `Status must be one of: ${validStatuses.join(', ')}`,
    });
    return;
  }

  try {
    const newContent = await prisma.content.create({
      data: {
        title: title.trim(),
        body: body.trim(),
        status,
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        body: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Content created successfully',
      content: newContent,
    });
    return;
  } catch (error) {
    console.error('Error creating content:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(409).json({
          message: 'A content with this title already exists',
        });
        return;
      }
    }

    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
    return;
  }
};
