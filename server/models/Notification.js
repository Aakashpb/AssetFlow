import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    default: 'info' // info, success, warning, danger, request
  },
  read: {
    type: Boolean,
    required: true,
    default: false
  },
  time: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
