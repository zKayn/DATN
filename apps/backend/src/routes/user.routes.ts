import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// Admin routes only
router.use(protect);
router.use(authorize('quan-tri'));

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
