import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { emailService } from '../services/emailService';

// GET /api/emails (Admin only)
export async function getEmailLogs(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const { page = '1', limit = '10', status } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = status ? { status: status as string } : {};

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.emailLog.count({ where }),
    ]);

    res.json({
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get email logs error:', error);
    res.status(500).json({ message: 'Failed to fetch email logs' });
  }
}

// POST /api/emails/:id/retry (Admin only)
export async function retryEmailLog(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const logId = req.params.id as string;
    
    const existing = await prisma.emailLog.findUnique({ where: { id: logId } });
    if (!existing) {
      res.status(404).json({ message: 'Email log not found' });
      return;
    }

    if (existing.status === 'SENT') {
      res.status(400).json({ message: 'Email is already sent' });
      return;
    }

    // Attempt retry
    await emailService.retryFailedEmail(logId);
    
    // Fetch updated log to return
    const updated = await prisma.emailLog.findUnique({ where: { id: logId } });
    
    res.json({ message: 'Retry executed', log: updated });
  } catch (error) {
    console.error('Retry email error:', error);
    res.status(500).json({ message: 'Failed to retry email' });
  }
}
