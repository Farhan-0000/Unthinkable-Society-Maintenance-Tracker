import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import { getOverdueThresholdDays } from './settingController';
import { emailService } from '../services/emailService';

// POST /api/complaints — Create complaint (Resident only)
export async function createComplaint(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { category, description, priority } = req.body;

    if (!category || !description) {
      res.status(400).json({ message: 'Category and description are required' });
      return;
    }

    // Build photo URL if file was uploaded
    let photoPath: string | undefined;
    if (req.file) {
      photoPath = `/uploads/complaints/${req.file.filename}`;
    }

    const complaint = await prisma.complaint.create({
      data: {
        residentId: req.user.userId,
        category,
        description,
        photoPath,
        priority: priority || 'MEDIUM',
      },
      include: {
        resident: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const overdueThresholdDays = await getOverdueThresholdDays();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - overdueThresholdDays);

    res.status(201).json({
      complaint: {
        ...complaint,
        photoUrl: complaint.photoPath,
        isOverdue: false // Brand new, can't be overdue
      }
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Failed to create complaint' });
  }
}

// GET /api/complaints — List complaints with filtering & pagination
export async function getComplaints(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const {
      status,
      priority,
      category,
      search,
      dateFrom,
      dateTo,
      isOverdue,
      page = '1',
      limit = '10',
    } = req.query;

    const overdueThresholdDays = await getOverdueThresholdDays();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - overdueThresholdDays);

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: Prisma.ComplaintWhereInput = {};

    // Residents can only see their own complaints
    if (req.user.role === 'RESIDENT') {
      where.residentId = req.user.userId;
    }

    if (status && typeof status === 'string') {
      where.status = status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    }

    if (isOverdue === 'true') {
      where.status = { in: ['OPEN', 'IN_PROGRESS'] };
      where.createdAt = { lt: thresholdDate };
    }

    if (priority && typeof priority === 'string') {
      where.priority = priority as 'LOW' | 'MEDIUM' | 'HIGH';
    }

    if (category && typeof category === 'string') {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      const existing = (where.createdAt as Record<string, unknown>) || {};
      where.createdAt = { ...existing };
      if (dateFrom && typeof dateFrom === 'string') {
        (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      }
      if (dateTo && typeof dateTo === 'string') {
        (where.createdAt as Record<string, unknown>).lte = new Date(dateTo);
      }
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          resident: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.complaint.count({ where }),
    ]);

    res.json({
      complaints: complaints.map(c => ({
        ...c,
        photoUrl: c.photoPath,
        isOverdue: ['OPEN', 'IN_PROGRESS'].includes(c.status) && new Date(c.createdAt) < thresholdDate
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
}

// GET /api/complaints/stats — Get complaint statistics
export async function getComplaintStats(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const whereBase: Prisma.ComplaintWhereInput =
      req.user.role === 'RESIDENT' ? { residentId: req.user.userId } : {};

    const overdueThresholdDays = await getOverdueThresholdDays();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - overdueThresholdDays);

    const [total, open, inProgress, resolved, highPriority, overdue] = await Promise.all([
      prisma.complaint.count({ where: whereBase }),
      prisma.complaint.count({ where: { ...whereBase, status: 'OPEN' } }),
      prisma.complaint.count({ where: { ...whereBase, status: 'IN_PROGRESS' } }),
      prisma.complaint.count({ where: { ...whereBase, status: 'RESOLVED' } }),
      prisma.complaint.count({ where: { ...whereBase, priority: 'HIGH' } }),
      prisma.complaint.count({ where: { ...whereBase, status: { in: ['OPEN', 'IN_PROGRESS'] }, createdAt: { lt: thresholdDate } } }),
    ]);

    res.json({ total, open, inProgress, resolved, highPriority, overdue });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
}

// GET /api/complaints/analytics — Get advanced analytics (Admin only)
export async function getAnalytics(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const { dateFrom, dateTo } = req.query;

    const where: Prisma.ComplaintWhereInput = {};
    if (dateFrom && dateTo) {
      where.createdAt = {
        gte: new Date(dateFrom as string),
        lte: new Date(dateTo as string),
      };
    } else if (dateFrom) {
      where.createdAt = { gte: new Date(dateFrom as string) };
    } else if (dateTo) {
      where.createdAt = { lte: new Date(dateTo as string) };
    }

    const overdueThresholdDays = await getOverdueThresholdDays();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - overdueThresholdDays);

    const [
      total,
      open,
      inProgress,
      resolved,
      overdue,
      statusGroup,
      priorityGroup,
      categoryGroup,
      monthlyDataRaw
    ] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.count({ where: { ...where, status: 'OPEN' } }),
      prisma.complaint.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.complaint.count({ where: { ...where, status: 'RESOLVED' } }),
      prisma.complaint.count({ where: { ...where, status: { in: ['OPEN', 'IN_PROGRESS'] }, createdAt: { lt: thresholdDate } } }),
      prisma.complaint.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      prisma.complaint.groupBy({
        by: ['priority'],
        where,
        _count: { id: true },
      }),
      prisma.complaint.groupBy({
        by: ['category'],
        where,
        _count: { id: true },
      }),
      // For monthly trends, Prisma doesn't have native DATE_TRUNC grouping yet in standard findMany,
      // so we fetch the raw created dates and group in memory (which is fine for realistic dashboard loads
      // or we can use raw SQL, but in-memory grouped is safer for cross-db compatibility).
      prisma.complaint.findMany({
        where,
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      })
    ]);

    // Format Monthly Trend Data
    const monthlyMap: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    monthlyDataRaw.forEach(c => {
      const d = new Date(c.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
    });

    const monthlyTrend = Object.keys(monthlyMap).map(name => ({
      name,
      value: monthlyMap[name]
    }));

    res.json({
      metrics: { total, open, inProgress, resolved, overdue },
      distributions: {
        status: statusGroup.map(g => ({ name: g.status, value: g._count.id })),
        priority: priorityGroup.map(g => ({ name: g.priority, value: g._count.id })),
        category: categoryGroup.map(g => ({ name: g.category, value: g._count.id })),
      },
      monthlyTrend
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
}

// GET /api/complaints/:id — Get single complaint
export async function getComplaint(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id as string },
      include: {
        resident: {
          select: { id: true, name: true, email: true },
        },
        history: {
          include: {
            actor: { select: { id: true, name: true } },
          },
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!complaint) {
      res.status(404).json({ message: 'Complaint not found' });
      return;
    }

    // Residents can only view their own complaints
    if (req.user.role === 'RESIDENT' && complaint.residentId !== req.user.userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const overdueThresholdDays = await getOverdueThresholdDays();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - overdueThresholdDays);

    res.json({
      complaint: {
        ...complaint,
        photoUrl: complaint.photoPath,
        isOverdue: ['OPEN', 'IN_PROGRESS'].includes(complaint.status) && new Date(complaint.createdAt) < thresholdDate
      }
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Failed to fetch complaint' });
  }
}

// PATCH /api/complaints/:id — Update complaint (Admin: status/priority, Resident: own category/description)
export async function updateComplaint(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const existing = await prisma.complaint.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existing) {
      res.status(404).json({ message: 'Complaint not found' });
      return;
    }

    const updateData: Prisma.ComplaintUpdateInput = {};

    if (req.user.role === 'ADMIN') {
      // Admin can update status and priority
      if (req.body.status) updateData.status = req.body.status;
      if (req.body.priority) updateData.priority = req.body.priority;
    } else if (req.user.role === 'RESIDENT') {
      // Resident can only update their own complaints' category and description
      if (existing.residentId !== req.user.userId) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      if (existing.status !== 'OPEN') {
        res.status(400).json({ message: 'Can only edit complaints with OPEN status' });
        return;
      }
      if (req.body.category) updateData.category = req.body.category;
      if (req.body.description) updateData.description = req.body.description;
    }

    let complaint;
    
    // If status is changing, we need a transaction to record history
    if (updateData.status && updateData.status !== existing.status) {
      const note = req.body.note;
      
      const transaction = await prisma.$transaction([
        prisma.complaint.update({
          where: { id: req.params.id as string },
          data: updateData,
          include: {
            resident: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        prisma.complaintHistory.create({
          data: {
            complaintId: req.params.id as string,
            previousStatus: existing.status,
            newStatus: updateData.status as any,
            actorId: req.user.userId,
            actorRole: req.user.role as any,
            note: note || null,
          }
        })
      ]);
      complaint = transaction[0];
    } else {
      complaint = await prisma.complaint.update({
        where: { id: req.params.id as string },
        data: updateData,
        include: {
          resident: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    }

    // Trigger Email Notification for Status or Priority changes
    if (updateData.status || updateData.priority) {
      // Don't await the email to block the response
      emailService.sendComplaintUpdateNotification(
        complaint.resident.email,
        complaint.resident.name,
        complaint.id,
        complaint.category,
        complaint.status,
        complaint.priority
      ).catch(err => console.error('Failed to send complaint update email:', err));
    }

    const overdueThresholdDays = await getOverdueThresholdDays();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - overdueThresholdDays);

    res.json({
      complaint: {
        ...complaint,
        photoUrl: complaint.photoPath,
        isOverdue: ['OPEN', 'IN_PROGRESS'].includes(complaint.status) && new Date(complaint.createdAt) < thresholdDate
      }
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ message: 'Failed to update complaint' });
  }
}

// DELETE /api/complaints/:id — Delete complaint (Admin only)
export async function deleteComplaint(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const existing = await prisma.complaint.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existing) {
      res.status(404).json({ message: 'Complaint not found' });
      return;
    }

    await prisma.complaint.delete({ where: { id: req.params.id as string } });

    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ message: 'Failed to delete complaint' });
  }
}
