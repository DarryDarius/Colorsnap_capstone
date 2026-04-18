import { Router } from 'express';
import { createBooking, fetchBooking } from '../controllers/bookingController';

const router = Router();

router.post('/', createBooking);
router.get('/:booking_id', fetchBooking);

export default router;
