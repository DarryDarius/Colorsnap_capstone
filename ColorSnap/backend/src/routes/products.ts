import { Router } from 'express';
import { fetchProductRecommendations } from '../controllers/productController';

const router = Router();

router.get('/recommendations', fetchProductRecommendations);

export default router;
