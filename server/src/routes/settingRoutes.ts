import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Both residents and admins might need to read settings (e.g. for overdue logic on frontend if needed, though mostly admin. But safe to let anyone read).
router.get('/', getSettings);

// Only admins can update settings
router.patch('/', authorize('ADMIN'), updateSettings);

export default router;
