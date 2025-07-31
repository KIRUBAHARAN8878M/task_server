import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { listUsers, updateRole } from '../controllers/userController.js';

const router = Router();
router.use(requireAuth);

// Per requirement: Admin only
router.get('/', requireRole('admin'), listUsers);
router.put('/:id/role', requireRole('admin'), updateRole);

export default router;