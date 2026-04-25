import { Router } from 'express';
import { createBooking, fetchBooking } from '../controllers/bookingController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/', optionalAuth, createBooking);
router.get('/:booking_id', optionalAuth, fetchBooking);

export default router;
