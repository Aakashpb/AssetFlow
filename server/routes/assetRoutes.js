import express from 'express';
import * as db from '../db/db.js';

const router = express.Router();

// Retrieve all assets list
router.get('/', async (req, res) => {
  try {
    const assets = await db.query('SELECT * FROM assets');
    
    // For each asset, fetch its timeline history logs
    const populatedAssets = await Promise.all(assets.map(async (asset) => {
      const history = await db.query('SELECT action, date, user FROM asset_history WHERE assetId = ? ORDER BY id DESC', [asset.id]);
      return {
        ...asset,
        cost: parseFloat(asset.cost),
        history
      };
    }));

    res.json(populatedAssets);
  } catch (error) {
    console.error('Fetch Assets Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

// Retrieve lookup catalogs (departments, categories, employees)
router.get('/catalogs', async (req, res) => {
  try {
    const departments = await db.query('SELECT * FROM departments');
    const employees = await db.query('SELECT * FROM employees');
    
    // Static Categories definitions match original setup
    const categories = [
      { id: 'cat-1', name: 'Laptops', icon: 'laptop' },
      { id: 'cat-2', name: 'Smartphones', icon: 'smartphone' },
      { id: 'cat-3', name: 'Furniture', icon: 'armchair' },
      { id: 'cat-4', name: 'Vehicles', icon: 'car' },
      { id: 'cat-5', name: 'Monitors', icon: 'monitor' }
    ];

    res.json({
      departments: departments.map(d => ({ ...d, budget: parseFloat(d.budget) })),
      employees,
      categories
    });
  } catch (error) {
    console.error('Fetch Catalogs Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

// Register new asset
router.post('/', async (req, res) => {
  const { tag, name, category, status, cost, purchaseDate, warrantyExpiry, location, assignedTo } = req.body;

  if (!tag || !name || !category || !status || !cost) {
    return res.status(400).json({ error: 'Missing critical asset parameters.' });
  }

  try {
    // Verify tag unique
    const tagCheck = await db.query('SELECT id FROM assets WHERE tag = ?', [tag]);
    if (tagCheck.length > 0) {
      return res.status(400).json({ error: `Asset Tag ID ${tag} is already registered.` });
    }

    const id = `asset-${Date.now()}`;
    const qrCode = `${tag}:${name}:${status}`;

    await db.query(
      'INSERT INTO assets (id, tag, name, category, status, assignedTo, cost, purchaseDate, warrantyExpiry, location, qrCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, tag, name, category, status, assignedTo || null, cost, purchaseDate || new Date(), warrantyExpiry || new Date(), location || 'Staging Lab', qrCode]
    );

    // Write initial history log
    await db.query(
      'INSERT INTO asset_history (assetId, action, date, user) VALUES (?, ?, ?, ?)',
      [id, 'Asset registered in system database', new Date(), 'System']
    );

    res.status(201).json({ success: true, assetId: id });
  } catch (error) {
    console.error('Register Asset Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

// Update asset status/attributes
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, status, cost, purchaseDate, warrantyExpiry, location, assignedTo, logAction, logUser } = req.body;

  try {
    const assets = await db.query('SELECT * FROM assets WHERE id = ?', [id]);
    if (assets.length === 0) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    const current = assets[0];

    await db.query(
      'UPDATE assets SET name=?, category=?, status=?, cost=?, purchaseDate=?, warrantyExpiry=?, location=?, assignedTo=? WHERE id=?',
      [
        name !== undefined ? name : current.name,
        category !== undefined ? category : current.category,
        status !== undefined ? status : current.status,
        cost !== undefined ? cost : current.cost,
        purchaseDate !== undefined ? purchaseDate : current.purchaseDate,
        warrantyExpiry !== undefined ? warrantyExpiry : current.warrantyExpiry,
        location !== undefined ? location : current.location,
        assignedTo !== undefined ? assignedTo : current.assignedTo,
        id
      ]
    );

    // If an action log is provided, append history event
    if (logAction) {
      await db.query(
        'INSERT INTO asset_history (assetId, action, date, user) VALUES (?, ?, ?, ?)',
        [id, logAction, new Date(), logUser || 'System']
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update Asset Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

// Delete asset record
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM assets WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Asset not found.' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete Asset Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

// Fetch log history for a single asset
router.get('/:id/history', async (req, res) => {
  const { id } = req.params;
  try {
    const history = await db.query('SELECT action, date, user FROM asset_history WHERE assetId = ? ORDER BY id DESC', [id]);
    res.json(history);
  } catch (error) {
    console.error('Fetch Asset History Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

// Create history log entry
router.post('/:id/history', async (req, res) => {
  const { id } = req.params;
  const { action, user } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'History description action is required.' });
  }

  try {
    await db.query(
      'INSERT INTO asset_history (assetId, action, date, user) VALUES (?, ?, ?, ?)',
      [id, action, new Date(), user || 'System']
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Log History Error:', error);
    res.status(500).json({ error: 'Internal server database error.' });
  }
});

export default router;
