import { Router } from 'express';
import { createOrder, fetchOrder } from '../controllers/orderController';

const router = Router();

router.post('/', createOrder);
router.get('/:order_id', fetchOrder);

export default router;
