import express from 'express';
import { getMetrics } from '../controllers/dashboardController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/metrics', verifyToken, getMetrics);

export default router;
