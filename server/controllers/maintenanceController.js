import Maintenance from '../models/Maintenance.js';
import Asset from '../models/Asset.js';
import { logActivity } from '../utilities/logger.js';

export const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Maintenance.find({ deletedAt: null }).sort({ updatedAt: -1 });
    const assets = await Asset.find();

    const ticketsWithAssets = tickets.map(t => {
      const assetObj = assets.find(a => a.id === t.assetId);
      return {
        ...t.toObject(),
        asset: assetObj ? { name: assetObj.name, tag: assetObj.tag } : null
      };
    });

    res.json(ticketsWithAssets);
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req, res, next) => {
  const { assetId, title, description, priority, status, assignedTo, cost, downtime } = req.body;

  try {
    const asset = await Asset.findOne({ id: assetId, deletedAt: null });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    const id = `ticket-${Date.now()}`;
    const ticket = await Maintenance.create({
      id,
      assetId,
      title,
      description: description || '',
      priority: priority || 'Medium',
      status: status || 'Backlog',
      assignedTo: assignedTo || null,
      cost: cost ? Number(cost) : 0.00,
      downtime: downtime ? Number(downtime) : 0
    });

    if (status === 'In Progress' || status === 'Scheduled') {
      asset.status = 'Maintenance';
      await asset.save();
    }

    await logActivity(req.user.uid, req.user.name, 'Maintenance Ticket Filed', `Filed ticket: ${title} for ${asset.name} (${asset.tag})`);

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

export const updateTicket = async (req, res, next) => {
  const { id } = req.params;
  const { status, priority, cost, downtime, assignedTo, description } = req.body;

  try {
    const ticket = await Maintenance.findOne({ id, deletedAt: null });
    if (!ticket) {
      return res.status(404).json({ error: 'Maintenance ticket not found.' });
    }

    const asset = await Asset.findOne({ id: ticket.assetId, deletedAt: null });

    ticket.status = status !== undefined ? status : ticket.status;
    ticket.priority = priority !== undefined ? priority : ticket.priority;
    ticket.cost = cost !== undefined ? Number(cost) : ticket.cost;
    ticket.downtime = downtime !== undefined ? Number(downtime) : ticket.downtime;
    ticket.assignedTo = assignedTo !== undefined ? assignedTo : ticket.assignedTo;
    ticket.description = description !== undefined ? description : ticket.description;

    await ticket.save();

    if (status === 'Completed' && asset) {
      asset.status = 'Available';
      await asset.save();
      
      await logActivity(req.user.uid, req.user.name, 'Maintenance Ticket Resolved', `Resolved ticket: ${ticket.title} on asset ${asset.name}`);
    }

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

export const getWarrantyReminders = async (req, res, next) => {
  try {
    const today = new Date();
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + 30);

    // Filter format: YYYY-MM-DD strings
    const todayStr = today.toISOString().split('T')[0];
    const limitStr = limitDate.toISOString().split('T')[0];

    const expiringAssets = await Asset.find({
      warrantyExpiry: { $gte: todayStr, $lte: limitStr },
      deletedAt: null
    });

    res.json({
      success: true,
      expiringCount: expiringAssets.length,
      assets: expiringAssets
    });
  } catch (error) {
    next(error);
  }
};
