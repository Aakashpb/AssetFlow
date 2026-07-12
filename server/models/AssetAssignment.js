import mongoose from 'mongoose';

const AssetAssignmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  assetId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    required: true,
    default: 'Active' // Active or Returned or Transferred
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'asset_assignments'
});

const AssetAssignment = mongoose.model('AssetAssignment', AssetAssignmentSchema);
export default AssetAssignment;
