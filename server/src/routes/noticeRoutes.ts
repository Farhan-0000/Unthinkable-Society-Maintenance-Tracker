import { Router } from 'express';
import {
  createNotice,
  getNotices,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Protect all routes
router.use(authenticate);

// Public / Authenticated read routes
router.get('/', getNotices);

// Admin only write routes
router.post('/', authorize('ADMIN'), createNotice);
router.patch('/:id', authorize('ADMIN'), updateNotice);
router.delete('/:id', authorize('ADMIN'), deleteNotice);

export default router;
