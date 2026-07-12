import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Role from './Role.js';

const User = sequelize.define('User', {
  uid: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  employeeId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'IT Operations'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Active' // Active or Deactivated
  },
  provider: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Email/Password' // Email/Password or Google
  },
  profilePicture: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true // Supports soft deletes
});

// Relationships
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

export default User;
