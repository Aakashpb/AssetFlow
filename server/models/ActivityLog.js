import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userUid: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  userName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  action: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'activity_logs',
  timestamps: true,
  updatedAt: false // Logs are immutable, only need createdAt
});

export default ActivityLog;
