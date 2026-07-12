import express from 'express';
import { getAllUsers, getProfile, updateProfile, uploadProfilePic, toggleUserStatus, deleteUser } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(verifyToken); // All user endpoints require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/avatar', upload.single('profilePicture'), uploadProfilePic);

// Admin restricted endpoints
router.get('/', authorizeRoles('Admin'), getAllUsers);
router.put('/:uid/status', authorizeRoles('Admin'), toggleUserStatus);
router.delete('/:uid', authorizeRoles('Admin'), deleteUser);

export default router;
