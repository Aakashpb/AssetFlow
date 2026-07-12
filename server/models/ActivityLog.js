import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  userUid: {
    type: String,
    default: 'system'
  },
  userName: {
    type: String,
    default: 'System'
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'activity_logs'
});

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
export default ActivityLog;
