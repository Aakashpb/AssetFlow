import Asset from '../models/Asset.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { generateQrCodeUri } from '../services/qrService.js';
import { logActivity } from '../utilities/logger.js';

export const getAllAssets = async (req, res, next) => {
  const { search, category, status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

  try {
    const query = { deletedAt: null };

    // Search query regexp matches
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { tag: regex },
        { brand: regex },
        { model: regex },
        { serialNumber: regex }
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;

    // Sorting clauses
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    const count = await Asset.countDocuments(query);
    const rows = await Asset.find(query)
      .sort(sort)
      .skip(skipNum)
      .limit(limitNum);

    res.json({
      success: true,
      totalItems: count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      assets: rows
    });
  } catch (error) {
    next(error);
  }
};

export const getAssetById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const asset = await Asset.findOne({ id, deletedAt: null });
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
    const existing = await Asset.findOne({ tag, deletedAt: null });
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
      purchaseCost: Number(purchaseCost),
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
    const asset = await Asset.findOne({ id, deletedAt: null });
    if (!asset) {
      return res.status(404).json({ error: 'Asset profile not found.' });
    }

    let imagePath = asset.assetImage;
    if (req.file) {
      imagePath = `/uploads/asset_images/${req.file.filename}`;
    }

    asset.tag = tag !== undefined ? tag : asset.tag;
    asset.name = name !== undefined ? name : asset.name;
    asset.category = category !== undefined ? category : asset.category;
    asset.brand = brand !== undefined ? brand : asset.brand;
    asset.model = model !== undefined ? model : asset.model;
    asset.serialNumber = serialNumber !== undefined ? serialNumber : asset.serialNumber;
    asset.purchaseDate = purchaseDate !== undefined ? purchaseDate : asset.purchaseDate;
    asset.purchaseCost = purchaseCost !== undefined ? Number(purchaseCost) : asset.purchaseCost;
    asset.warrantyExpiry = warrantyExpiry !== undefined ? warrantyExpiry : asset.warrantyExpiry;
    asset.status = status !== undefined ? status : asset.status;
    asset.location = location !== undefined ? location : asset.location;
    asset.assignedTo = assignedTo !== undefined ? assignedTo : asset.assignedTo;
    asset.description = description !== undefined ? description : asset.description;
    asset.assetImage = imagePath;

    await asset.save();

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
    const asset = await Asset.findOne({ id, deletedAt: null });
    if (!asset) {
      return res.status(404).json({ error: 'Asset profile not found.' });
    }

    asset.deletedAt = new Date(); // Soft delete Mongoose model
    await asset.save();

    await logActivity(req.user.uid, req.user.name, 'Asset Deletion Event', `Soft-deleted Asset ID: ${id}`);

    res.json({ success: true, message: 'Asset record soft-deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getCatalogs = async (req, res, next) => {
  try {
    const users = await User.find({ deletedAt: null });
    const roles = await Role.find();

    const employeesMap = users.map(u => {
      const roleRecord = roles.find(r => r.id === u.roleId);
      return {
        id: u.uid,
        name: u.name,
        email: u.email,
        department: u.department,
        role: roleRecord?.name || 'Employee'
      };
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
      employees: employeesMap,
      categories,
      departments
    });
  } catch (error) {
    next(error);
  }
};
