import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  tag: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  serialNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  purchaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  purchaseCost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  warrantyExpiry: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Available' // Available, Allocated, Maintenance, Retired, Lost, Damaged
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Staging Lab'
  },
  assignedTo: {
    type: DataTypes.STRING(50), // UID of user or employee
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  qrCode: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  assetImage: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'assets',
  timestamps: true,
  paranoid: true
});

export default Asset;
