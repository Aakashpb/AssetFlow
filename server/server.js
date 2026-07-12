import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Import Mongoose Models for Seeding
import Role from './models/Role.js';
import Category from './models/Category.js';

// Import Express Routes Mappings
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Hardening Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Express Rate Limiter: 100 requests per 15 minutes limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many API requests from this client. Please slow down.' }
});
app.use('/api/', limiter);

// Serve uploads directories statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger Interactive API Docs Route Setup
try {
  const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.log('⚠️ Could not configure Swagger UI API docs: check swagger.json integrity.');
}

// REST API Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Root Ping Handler
app.get('/ping', (req, res) => {
  res.json({ status: 'online', service: 'AssetFlow Production MVC API Server', ORM: 'Mongoose' });
});

// Centralized Express Exception Handler
app.use(errorHandler);

// Database Connector & Seeder Trigger
const initDatabase = async () => {
  try {
    await connectDB();

    // Seed default lookup roles if MongoDB database is empty
    const roleCount = await Role.countDocuments();
    if (roleCount === 0) {
      await Role.create([
        { id: 'role-admin', name: 'Admin' },
        { id: 'role-mgr', name: 'Manager' },
        { id: 'role-emp', name: 'Employee' }
      ]);
      console.log('🌱 Seeded default lookup roles: Admin, Manager, Employee in MongoDB.');
    }

    // Seed categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      await Category.create([
        { id: 'cat-1', name: 'Laptops', icon: 'laptop' },
        { id: 'cat-2', name: 'Smartphones', icon: 'smartphone' },
        { id: 'cat-3', name: 'Furniture', icon: 'armchair' },
        { id: 'cat-4', name: 'Vehicles', icon: 'car' },
        { id: 'cat-5', name: 'Monitors', icon: 'monitor' }
      ]);
      console.log('🌱 Seeded default lookup categories in MongoDB.');
    }
  } catch (error) {
    console.warn('⚠️ MongoDB Initial Seeder Failed:', error.message);
  }
};

// Start Server listener if not in testing environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    await initDatabase();
    console.log(`🚀 AssetFlow secure corporate server listening on http://localhost:${PORT}`);
    console.log(`📖 View Swagger API specs interactive UI on http://localhost:${PORT}/api-docs`);
  });
} else {
  await initDatabase();
}

export default app;
