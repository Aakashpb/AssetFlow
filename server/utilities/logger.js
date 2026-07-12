import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (userUid, userName, action, details) => {
  try {
    await ActivityLog.create({
      userUid: userUid || 'system',
      userName: userName || 'System',
      action,
      details: typeof details === 'object' ? JSON.stringify(details) : details
    });
  } catch (error) {
    console.error('Failed to write activity audit log:', error.message);
  }
};
