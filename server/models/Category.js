import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'categories',
  timestamps: false,
  paranoid: false
});

export default Category;
