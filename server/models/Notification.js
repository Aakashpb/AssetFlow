import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'info' // info, success, warning, danger, request
  },
  read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  time: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  paranoid: false
});

export default Notification;
