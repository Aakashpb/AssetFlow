import express from 'express';
import { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset, getCatalogs } from '../controllers/assetController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllAssets);
router.get('/catalogs', getCatalogs);
router.get('/:id', getAssetById);

// Admin / Manager restricted CRUD
router.post('/', authorizeRoles('Admin', 'Asset Manager'), upload.single('assetImage'), createAsset);
router.put('/:id', authorizeRoles('Admin', 'Asset Manager'), upload.single('assetImage'), updateAsset);
router.delete('/:id', authorizeRoles('Admin', 'Asset Manager'), deleteAsset);

export default router;
