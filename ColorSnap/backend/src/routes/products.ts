import { Router } from 'express';
import { fetchProductDetail, fetchProductRecommendations } from '../controllers/productController';

const router = Router();

router.get('/recommendations', fetchProductRecommendations);
router.get('/:slug', fetchProductDetail);

export default router;
