import express from 'express';
import { exportAssetReport, exportMaintenanceReport, exportUserReport, exportAssignmentReport } from '../controllers/reportController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/assets', exportAssetReport);
router.get('/maintenance', exportMaintenanceReport);
router.get('/users', exportUserReport);
router.get('/assignments', exportAssignmentReport);

export default router;
