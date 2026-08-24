import { Router } from 'express';
import { getEmailLogs, retryEmailLog } from '../controllers/emailLogController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Protect all routes - Admin only
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', getEmailLogs);
router.post('/:id/retry', retryEmailLog);

export default router;
