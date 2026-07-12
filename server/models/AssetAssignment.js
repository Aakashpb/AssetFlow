import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Asset from './Asset.js';
import User from './User.js';

const AssetAssignment = sequelize.define('AssetAssignment', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  returnDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Active' // Active or Returned or Transferred
  }
}, {
  tableName: 'asset_assignments',
  timestamps: true,
  paranoid: true
});

// Relationships
AssetAssignment.belongsTo(Asset, { foreignKey: 'assetId', as: 'asset' });
AssetAssignment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default AssetAssignment;
