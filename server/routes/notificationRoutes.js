import express from 'express';
import * as db from '../db/db.js';

const router = express.Router();

// Retrieve all notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await db.query('SELECT * FROM notifications ORDER BY createdAt DESC');
    res.json(notifications.map(n => ({
      ...n,
      read: n.read === 1 || n.read === true
    })));
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

// Mark single notification read
router.put('/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE notifications SET `read` = TRUE WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

// Clear all notifications
router.delete('/', async (req, res) => {
  try {
    await db.query('DELETE FROM notifications');
    res.json({ success: true });
  } catch (error) {
    console.error('Clear Notifications Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

export default router;
