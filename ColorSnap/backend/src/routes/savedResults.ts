import { Router } from 'express';
import { createSavedResult, fetchSavedResult } from '../controllers/savedResultController';

const router = Router();

router.post('/', createSavedResult);
router.get('/:saved_result_id', fetchSavedResult);

export default router;
