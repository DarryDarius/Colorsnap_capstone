import { Router } from 'express';
import {
  addProductToSavedLook,
  createSavedLook,
  deleteSavedLook,
  fetchSavedLooks,
  updateSavedLook
} from '../controllers/savedLookController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(optionalAuth);
router.get('/', fetchSavedLooks);
router.post('/', createSavedLook);
router.post('/products', addProductToSavedLook);
router.patch('/:look_id', updateSavedLook);
router.delete('/:look_id', deleteSavedLook);

export default router;
