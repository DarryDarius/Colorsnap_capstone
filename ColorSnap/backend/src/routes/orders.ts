import { Router } from 'express';
import { createOrder, fetchOrder } from '../controllers/orderController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/', optionalAuth, createOrder);
router.get('/:order_id', optionalAuth, fetchOrder);

export default router;
