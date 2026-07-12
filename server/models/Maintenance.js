import mongoose from 'mongoose';

const MaintenanceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  assetId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    required: true,
    default: 'Medium' // Low, Medium, High
  },
  status: {
    type: String,
    required: true,
    default: 'Backlog' // Backlog, Scheduled, In Progress, Review, Completed
  },
  assignedTo: {
    type: String,
    default: null
  },
  cost: {
    type: Number,
    required: true,
    default: 0.00
  },
  downtime: {
    type: Number,
    required: true,
    default: 0 // In days
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'maintenance_tickets'
});

const Maintenance = mongoose.model('Maintenance', MaintenanceSchema);
export default Maintenance;
