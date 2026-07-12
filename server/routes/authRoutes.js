import express from 'express';
import { register, login, googleLogin, forgotPassword, resetPassword, logout } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../validations/authValidation.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', verifyToken, logout);

export default router;
