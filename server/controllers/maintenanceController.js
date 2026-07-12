import { Op } from 'sequelize';
import Maintenance from '../models/Maintenance.js';
import Asset from '../models/Asset.js';
import { logActivity } from '../utilities/logger.js';

export const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Maintenance.findAll({
      include: [{ model: Asset, as: 'asset', attributes: ['name', 'tag'] }],
      order: [['updatedAt', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req, res, next) => {
  const { assetId, title, description, priority, status, assignedTo, cost, downtime } = req.body;

  try {
    const asset = await Asset.findByPk(assetId);
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
      cost: cost || 0.00,
      downtime: downtime || 0
    });

    // Toggle asset state to Maintenance if scheduled/in progress
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
    const ticket = await Maintenance.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Maintenance ticket not found.' });
    }

    const asset = await Asset.findByPk(ticket.assetId);

    await ticket.update({
      status: status !== undefined ? status : ticket.status,
      priority: priority !== undefined ? priority : ticket.priority,
      cost: cost !== undefined ? cost : ticket.cost,
      downtime: downtime !== undefined ? downtime : ticket.downtime,
      assignedTo: assignedTo !== undefined ? assignedTo : ticket.assignedTo,
      description: description !== undefined ? description : ticket.description
    });

    // If ticket is resolved/completed, set asset state back to Available
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
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + 30); // 30 days buffer

    const expiringAssets = await Asset.findAll({
      where: {
        warrantyExpiry: {
          [Op.between]: [new Date(), limitDate]
        }
      }
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
