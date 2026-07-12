import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import sequelize from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Import Sequelize Models for Auto-Sync/Seeding
import Role from './models/Role.js';
import Category from './models/Category.js';
import User from './models/User.js';
import Asset from './models/Asset.js';
import AssetAssignment from './models/AssetAssignment.js';
import Maintenance from './models/Maintenance.js';
import Notification from './models/Notification.js';

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
  crossOriginResourcePolicy: false // Allows loading local file system uploads images directly
}));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev')); // Dev console logging

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
  res.json({ status: 'online', service: 'AssetFlow Production MVC API Server', ORM: 'Sequelize' });
});

// Centralized Express Exception Handler
app.use(errorHandler);

// Database Synchronizer & Initial Seeder Trigger
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to MySQL validated successfully via Sequelize.');

    // Sync database schemas
    await sequelize.sync({ alter: true });
    console.log('✅ MySQL Database schemas synced successfully.');

    // Seed default lookup roles if database is empty
    const roleCount = await Role.count();
    if (roleCount === 0) {
      await Role.bulkCreate([
        { id: 'role-admin', name: 'Admin' },
        { id: 'role-mgr', name: 'Manager' },
        { id: 'role-emp', name: 'Employee' }
      ]);
      console.log('🌱 Seeded default lookup roles: Admin, Manager, Employee.');
    }

    // Seed categories
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      await Category.bulkCreate([
        { id: 'cat-1', name: 'Laptops', icon: 'laptop' },
        { id: 'cat-2', name: 'Smartphones', icon: 'smartphone' },
        { id: 'cat-3', name: 'Furniture', icon: 'armchair' },
        { id: 'cat-4', name: 'Vehicles', icon: 'car' },
        { id: 'cat-5', name: 'Monitors', icon: 'monitor' }
      ]);
      console.log('🌱 Seeded default lookup categories.');
    }
  } catch (error) {
    console.warn('⚠️ MySQL Auto-migration / Connection Failed:', error.message);
    console.log('Sequelize operations will require MySQL database active to run correctly.');
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

export default app; // For integration testing triggers
