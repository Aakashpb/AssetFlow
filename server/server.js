import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Endpoints Routing
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/notifications', notificationRoutes);

// Root ping test endpoint
app.get('/ping', (req, res) => {
  res.json({ status: 'online', service: 'AssetFlow Backend API Server', database: 'MySQL' });
});

// Graceful 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint routing not found.' });
});

app.listen(PORT, () => {
  console.log(`🚀 AssetFlow secure corporate server running on http://localhost:${PORT}`);
});
