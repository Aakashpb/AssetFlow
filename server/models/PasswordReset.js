import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const PasswordReset = sequelize.define('PasswordReset', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  token: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  expiry: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'password_resets',
  timestamps: true,
  updatedAt: false
});

export default PasswordReset;
