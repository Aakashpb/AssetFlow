import express from 'express';
import { assignAsset, returnAsset, transferAsset, getAssignmentHistory } from '../controllers/assignmentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/assign', authorizeRoles('Admin', 'Asset Manager'), assignAsset);
router.post('/return', authorizeRoles('Admin', 'Asset Manager'), returnAsset);
router.post('/transfer', authorizeRoles('Admin', 'Asset Manager'), transferAsset);
router.get('/history', getAssignmentHistory);

export default router;
