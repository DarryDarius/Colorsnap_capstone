import { Router } from 'express';
import { createShare, fetchShare } from '../controllers/shareController';

const router = Router();

router.post('/', createShare);
router.get('/:share_id', fetchShare);

export default router;
