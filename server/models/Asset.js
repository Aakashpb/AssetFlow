import mongoose from 'mongoose';

const AssetSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  tag: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    default: ''
  },
  model: {
    type: String,
    default: ''
  },
  serialNumber: {
    type: String,
    default: ''
  },
  purchaseDate: {
    type: String,
    required: true
  },
  purchaseCost: {
    type: Number,
    required: true,
    default: 0.00
  },
  warrantyExpiry: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'Available' // Available, Allocated, Maintenance, Retired, Lost, Damaged
  },
  location: {
    type: String,
    required: true,
    default: 'Staging Lab'
  },
  assignedTo: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  qrCode: {
    type: String,
    default: null
  },
  assetImage: {
    type: String,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'assets'
});

const Asset = mongoose.model('Asset', AssetSchema);
export default Asset;
