import express from 'express';
import * as db from '../db/db.js';

const router = express.Router();

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await db.query('SELECT * FROM bookings');
    res.json(bookings);
  } catch (error) {
    console.error('Fetch Bookings Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

// Book resources with overlaps checking validation
router.post('/', async (req, res) => {
  const { assetId, title, start, end, userId } = req.body;

  if (!assetId || !title || !start || !end || !userId) {
    return res.status(400).json({ error: 'Missing reservation parameters.' });
  }

  try {
    // Check overlap: new start < existing.end AND new end > existing.start
    const overlapQuery = `
      SELECT id FROM bookings 
      WHERE assetId = ? 
        AND start < ? 
        AND end > ?
    `;
    const conflicts = await db.query(overlapQuery, [assetId, end, start]);

    if (conflicts.length > 0) {
      return res.status(400).json({ 
        error: 'Double-Booking Conflict: This resource is already reserved for the selected timeframe.' 
      });
    }

    const id = `booking-${Date.now()}`;
    await db.query(
      'INSERT INTO bookings (id, assetId, title, start, end, userId) VALUES (?, ?, ?, ?, ?, ?)',
      [id, assetId, title, start, end, userId]
    );

    res.status(201).json({ success: true, bookingId: id });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

export default router;
