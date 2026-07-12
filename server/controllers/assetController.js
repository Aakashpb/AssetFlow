import { Op } from 'sequelize';
import Asset from '../models/Asset.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { generateQrCodeUri } from '../services/qrService.js';
import { logActivity } from '../utilities/logger.js';

export const getAllAssets = async (req, res, next) => {
  const { search, category, status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

  try {
    const whereClause = {};

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { tag: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
        { serialNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    // Category and status exact filters
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;

    // Sorting parameters
    const orderClause = [];
    if (sortBy) {
      orderClause.push([sortBy, sortOrder === 'desc' ? 'DESC' : 'ASC']);
    } else {
      orderClause.push(['createdAt', 'DESC']);
    }

    // Pagination calculations
    const limitNum = parseInt(limit);
    const offsetNum = (parseInt(page) - 1) * limitNum;

    const { count, rows } = await Asset.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: limitNum,
      offset: offsetNum
    });

    res.json({
      success: true,
      totalItems: count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: parseInt(page),
      assets: rows
    });
  } catch (error) {
    next(error);
  }
};

export const getAssetById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset profile not found.' });
    }
    res.json(asset);
  } catch (error) {
    next(error);
  }
};

export const createAsset = async (req, res, next) => {
  const { tag, name, category, brand, model, serialNumber, purchaseDate, purchaseCost, warrantyExpiry, location, description, assignedTo } = req.body;

  try {
    const existing = await Asset.findOne({ where: { tag } });
    if (existing) {
      return res.status(400).json({ error: `Asset Tag ID ${tag} is already registered.` });
    }

    const id = `asset-${Date.now()}`;
    const qrCodeText = `${tag}:${name}:${category}`;
    const qrCodeUri = await generateQrCodeUri(qrCodeText);

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/asset_images/${req.file.filename}`;
    }

    const asset = await Asset.create({
      id,
      tag,
      name,
      category,
      brand,
      model,
      serialNumber,
      purchaseDate,
      purchaseCost,
      warrantyExpiry,
      status: assignedTo ? 'Allocated' : 'Available',
      location: location || 'Staging Lab',
      assignedTo: assignedTo || null,
      description,
      qrCode: qrCodeUri,
      assetImage: imagePath
    });

    await logActivity(req.user.uid, req.user.name, 'Asset Creation Event', `Registered asset: ${name} (Tag: ${tag})`);

    res.status(201).json({ success: true, asset });
  } catch (error) {
    next(error);
  }
};

export const updateAsset = async (req, res, next) => {
  const { id } = req.params;
  const { tag, name, category, brand, model, serialNumber, purchaseDate, purchaseCost, warrantyExpiry, status, location, assignedTo, description, logAction } = req.body;

  try {
    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset profile not found.' });
    }

    let imagePath = asset.assetImage;
    if (req.file) {
      imagePath = `/uploads/asset_images/${req.file.filename}`;
    }

    await asset.update({
      tag: tag !== undefined ? tag : asset.tag,
      name: name !== undefined ? name : asset.name,
      category: category !== undefined ? category : asset.category,
      brand: brand !== undefined ? brand : asset.brand,
      model: model !== undefined ? model : asset.model,
      serialNumber: serialNumber !== undefined ? serialNumber : asset.serialNumber,
      purchaseDate: purchaseDate !== undefined ? purchaseDate : asset.purchaseDate,
      purchaseCost: purchaseCost !== undefined ? purchaseCost : asset.purchaseCost,
      warrantyExpiry: warrantyExpiry !== undefined ? warrantyExpiry : asset.warrantyExpiry,
      status: status !== undefined ? status : asset.status,
      location: location !== undefined ? location : asset.location,
      assignedTo: assignedTo !== undefined ? assignedTo : asset.assignedTo,
      description: description !== undefined ? description : asset.description,
      assetImage: imagePath
    });

    if (logAction) {
      await logActivity(req.user.uid, req.user.name, 'Asset Modification Event', `${logAction} on Asset ID: ${id}`);
    }

    res.json({ success: true, asset });
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req, res, next) => {
  const { id } = req.params;

  try {
    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset profile not found.' });
    }

    await asset.destroy(); // Soft delete database record

    await logActivity(req.user.uid, req.user.name, 'Asset Deletion Event', `Soft-deleted Asset ID: ${id}`);

    res.json({ success: true, message: 'Asset record soft-deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getCatalogs = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['uid', 'name', 'email', 'department'],
      include: [{ model: Role, as: 'role' }]
    });

    const categories = [
      { id: 'cat-1', name: 'Laptops', icon: 'laptop' },
      { id: 'cat-2', name: 'Smartphones', icon: 'smartphone' },
      { id: 'cat-3', name: 'Furniture', icon: 'armchair' },
      { id: 'cat-4', name: 'Vehicles', icon: 'car' },
      { id: 'cat-5', name: 'Monitors', icon: 'monitor' }
    ];

    const departments = [
      { id: 'dept-1', name: 'Research & Development', head: 'Alexander Vance', budget: 750000 },
      { id: 'dept-2', name: 'IT Operations', head: 'Marcus Brody', budget: 450000 },
      { id: 'dept-3', name: 'Operations', head: 'Sarah Connor', budget: 300000 },
      { id: 'dept-4', name: 'Legal', head: 'Ellen Ripley', budget: 150000 },
      { id: 'dept-5', name: 'Executive Office', head: 'Bruce Wayne', budget: 900000 }
    ];

    res.json({
      employees: users.map(u => ({ id: u.uid, name: u.name, email: u.email, department: u.department, role: u.role?.name || 'Employee' })),
      categories,
      departments
    });
  } catch (error) {
    next(error);
  }
};
