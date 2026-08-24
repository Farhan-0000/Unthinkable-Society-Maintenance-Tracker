import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintStats,
  getAnalytics,
  getComplaint,
  updateComplaint,
  deleteComplaint,
} from '../controllers/complaintController';
import { authenticate, authorize } from '../middleware/auth';
import { uploadPhoto } from '../middleware/uploadMiddleware';

const router = Router();

// All complaint routes require authentication
router.use(authenticate);

// Stats must come before :id to avoid conflict
router.get('/stats', getComplaintStats);
router.get('/analytics', authorize('ADMIN'), getAnalytics);

// CRUD routes
router.post('/', authorize('RESIDENT'), uploadPhoto, createComplaint);
router.get('/', getComplaints);
router.get('/:id', getComplaint);
router.patch('/:id', updateComplaint);
router.delete('/:id', authorize('ADMIN'), deleteComplaint);

export default router;
