import express from 'express';
import * as db from '../db/db.js';

const router = express.Router();

// Retrieve all maintenance tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await db.query('SELECT * FROM maintenance_tickets');
    res.json(tickets.map(t => ({
      ...t,
      cost: parseFloat(t.cost)
    })));
  } catch (error) {
    console.error('Fetch Maintenance Tickets Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

// File a maintenance ticket
router.post('/', async (req, res) => {
  const { assetId, title, description, priority, status, assignedTo, cost, downtime } = req.body;

  if (!assetId || !title || !priority || !status) {
    return res.status(400).json({ error: 'Missing critical ticket parameters.' });
  }

  try {
    const id = `ticket-${Date.now()}`;
    const now = new Date();

    await db.query(
      'INSERT INTO maintenance_tickets (id, assetId, title, description, priority, status, assignedTo, cost, downtime, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, assetId, title, description || '', priority, status, assignedTo || null, cost || 0.00, downtime || 0, now, now]
    );

    // Also update asset status in the assets registry if status matches In Progress or Maintenance
    if (status === 'In Progress' || status === 'Scheduled') {
      await db.query('UPDATE assets SET status = ? WHERE id = ?', ['Maintenance', assetId]);
      
      // Add timeline history event log
      await db.query(
        'INSERT INTO asset_history (assetId, action, date, user) VALUES (?, ?, ?, ?)',
        [assetId, `Maintenance Ticket Filed: ${title}`, now, assignedTo || 'IT Tech']
      );
    }

    res.status(201).json({ success: true, ticketId: id });
  } catch (error) {
    console.error('Create Maintenance Ticket Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

// Edit ticket details/status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, priority, cost, downtime, assignedTo, description } = req.body;

  try {
    const tickets = await db.query('SELECT * FROM maintenance_tickets WHERE id = ?', [id]);
    if (tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const current = tickets[0];
    const now = new Date();

    await db.query(
      'UPDATE maintenance_tickets SET status=?, priority=?, cost=?, downtime=?, assignedTo=?, description=?, updatedAt=? WHERE id=?',
      [
        status !== undefined ? status : current.status,
        priority !== undefined ? priority : current.priority,
        cost !== undefined ? cost : current.cost,
        downtime !== undefined ? downtime : current.downtime,
        assignedTo !== undefined ? assignedTo : current.assignedTo,
        description !== undefined ? description : current.description,
        now,
        id
      ]
    );

    // If ticket is completed, return the associated asset back to "Available"
    if (status === 'Completed') {
      await db.query('UPDATE assets SET status = ? WHERE id = ?', ['Available', current.assetId]);
      
      // Log completion in asset history
      await db.query(
        'INSERT INTO asset_history (assetId, action, date, user) VALUES (?, ?, ?, ?)',
        [current.assetId, `Maintenance Ticket Resolved: ${current.title}`, now, assignedTo || 'IT Tech']
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update Maintenance Ticket Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

export default router;
