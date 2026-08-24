import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import { emailService } from '../services/emailService';

// POST /api/notices (Admin only)
export async function createNotice(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const { title, content, isImportant } = req.body;

    if (!title || !content) {
      res.status(400).json({ message: 'Title and content are required' });
      return;
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        isImportant: isImportant || false,
        createdById: req.user.userId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (notice.isImportant) {
      emailService.broadcastImportantNotice(notice.title, notice.content)
        .catch(err => console.error('Failed to broadcast important notice:', err));
    }

    res.status(201).json({ notice });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ message: 'Failed to create notice' });
  }
}

// GET /api/notices (Public/Authenticated)
export async function getNotices(req: Request, res: Response): Promise<void> {
  try {
    const {
      search,
      isImportant,
      page = '1',
      limit = '10',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.NoticeWhereInput = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isImportant === 'true') {
      where.isImportant = true;
    } else if (isImportant === 'false') {
      where.isImportant = false;
    }

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: [
          { isImportant: 'desc' }, // Important first
          { createdAt: 'desc' }    // Then newest first
        ],
        skip,
        take: limitNum,
      }),
      prisma.notice.count({ where }),
    ]);

    res.json({
      data: notices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ message: 'Failed to fetch notices' });
  }
}

// PATCH /api/notices/:id (Admin only)
export async function updateNotice(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const { title, content, isImportant } = req.body;

    const existing = await prisma.notice.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existing) {
      res.status(404).json({ message: 'Notice not found' });
      return;
    }

    const notice = await prisma.notice.update({
      where: { id: req.params.id as string },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(typeof isImportant === 'boolean' && { isImportant }),
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    // If it was just marked as important, or important content was updated
    if (notice.isImportant) {
      emailService.broadcastImportantNotice(notice.title, notice.content)
        .catch(err => console.error('Failed to broadcast important notice:', err));
    }

    res.json({ notice });
  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({ message: 'Failed to update notice' });
  }
}

// DELETE /api/notices/:id (Admin only)
export async function deleteNotice(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const existing = await prisma.notice.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existing) {
      res.status(404).json({ message: 'Notice not found' });
      return;
    }

    await prisma.notice.delete({ where: { id: req.params.id as string } });

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ message: 'Failed to delete notice' });
  }
}
