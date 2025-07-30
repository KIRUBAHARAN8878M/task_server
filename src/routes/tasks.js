import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { listTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/taskController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
