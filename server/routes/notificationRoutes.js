import express from 'express';
import { getAllNotifications, markRead, clearAll } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllNotifications);
router.put('/:id/read', markRead);
router.delete('/', clearAll);

export default router;
