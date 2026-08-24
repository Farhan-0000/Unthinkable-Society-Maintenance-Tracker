import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Helper to get threshold value
export async function getOverdueThresholdDays(): Promise<number> {
  const setting = await prisma.setting.findUnique({
    where: { key: 'OVERDUE_THRESHOLD' },
  });
  return setting ? parseInt(setting.value, 10) : 7; // Default 7 days
}

// GET /api/settings
export async function getSettings(req: Request, res: Response): Promise<void> {
  try {
    const overdueThresholdDays = await getOverdueThresholdDays();
    res.json({ overdueThresholdDays });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
}

// PATCH /api/settings
export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    const { overdueThresholdDays } = req.body;

    if (typeof overdueThresholdDays !== 'number' || overdueThresholdDays < 1) {
      res.status(400).json({ message: 'Invalid overdueThresholdDays' });
      return;
    }

    await prisma.setting.upsert({
      where: { key: 'OVERDUE_THRESHOLD' },
      update: { value: overdueThresholdDays.toString() },
      create: { key: 'OVERDUE_THRESHOLD', value: overdueThresholdDays.toString() },
    });

    res.json({ message: 'Settings updated successfully', overdueThresholdDays });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
}
