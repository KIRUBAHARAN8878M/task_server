// import { Router } from 'express';
// import { requireAuth, requireRole } from '../middlewares/auth.js';
// import { listUsers, updateRole } from '../controllers/userController.js';

// const router = Router();

// // Everyone here must be authenticated
// router.use(requireAuth);

// // Managers **and** Admins can list users (read-only)
// router.get('/', requireRole('admin', 'manager'), listUsers);

// // Only Admins can update roles
// router.put('/:id/role', requireRole('admin'), updateRole);

// export default router;

// server/src/routes/users.js
import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { listUsers, updateRole } from '../controllers/userController.js';

const router = Router();
router.use(requireAuth);

// Per requirement: Admin only
router.get('/', requireRole('admin'), listUsers);
router.put('/:id/role', requireRole('admin'), updateRole);

export default router;