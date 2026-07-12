import Notification from '../models/Notification.js';

export const getAllNotifications = async (req, res, next) => {
  try {
    const list = await Notification.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  const { id } = req.params;
  try {
    const alert = await Notification.findOne({ id });
    if (!alert) {
      return res.status(404).json({ error: 'Notification not found.' });
    }
    alert.read = true;
    await alert.save();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (title, message, type) => {
  try {
    await Notification.create({
      id: `notif-${Date.now()}`,
      title,
      message,
      type: type || 'info',
      read: false,
      time: 'Just now'
    });
  } catch (error) {
    console.error('Failed to log system notification:', error.message);
  }
};
