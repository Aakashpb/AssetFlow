import express from 'express';
import { getAllTickets, createTicket, updateTicket, getWarrantyReminders } from '../controllers/maintenanceController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllTickets);
router.post('/', createTicket);
router.put('/:id', updateTicket);
router.get('/warranty-alerts', getWarrantyReminders);

export default router;
