import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Asset from './Asset.js';

const Maintenance = sequelize.define('Maintenance', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Medium' // Low, Medium, High
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Backlog' // Backlog, Scheduled, In Progress, Review, Completed
  },
  assignedTo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  downtime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0 // In days
  }
}, {
  tableName: 'maintenance_tickets',
  timestamps: true,
  paranoid: true
});

// Relationships
Maintenance.belongsTo(Asset, { foreignKey: 'assetId', as: 'asset' });

export default Maintenance;
