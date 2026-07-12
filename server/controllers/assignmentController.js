import Asset from '../models/Asset.js';
import User from '../models/User.js';
import AssetAssignment from '../models/AssetAssignment.js';
import { logActivity } from '../utilities/logger.js';

export const assignAsset = async (req, res, next) => {
  const { assetId, employeeId } = req.body;

  try {
    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    if (asset.status !== 'Available') {
      return res.status(400).json({ error: `Asset check-out failed. Asset is currently: ${asset.status}` });
    }

    const employee = await User.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const id = `assign-${Date.now()}`;
    await AssetAssignment.create({
      id,
      assetId,
      userId: employeeId,
      issueDate: new Date(),
      status: 'Active'
    });

    asset.status = 'Allocated';
    asset.assignedTo = employeeId;
    await asset.save();

    await logActivity(req.user.uid, req.user.name, 'Asset Assignment Event', `Assigned ${asset.name} (Tag: ${asset.tag}) to ${employee.name}`);

    res.json({ success: true, message: 'Asset assigned successfully.' });
  } catch (error) {
    next(error);
  }
};

export const returnAsset = async (req, res, next) => {
  const { assetId } = req.body;

  try {
    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    const activeAssignment = await AssetAssignment.findOne({
      where: { assetId, status: 'Active' }
    });

    if (activeAssignment) {
      activeAssignment.status = 'Returned';
      activeAssignment.returnDate = new Date();
      await activeAssignment.save();
    }

    asset.status = 'Available';
    asset.assignedTo = null;
    await asset.save();

    await logActivity(req.user.uid, req.user.name, 'Asset Return Event', `Returned asset ${asset.name} (Tag: ${asset.tag}) to IT inventory`);

    res.json({ success: true, message: 'Asset returned successfully.' });
  } catch (error) {
    next(error);
  }
};

export const transferAsset = async (req, res, next) => {
  const { assetId, targetEmployeeId } = req.body;

  try {
    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    const targetEmployee = await User.findByPk(targetEmployeeId);
    if (!targetEmployee) {
      return res.status(404).json({ error: 'Target employee not found.' });
    }

    // Complete current assignment
    const activeAssignment = await AssetAssignment.findOne({
      where: { assetId, status: 'Active' }
    });

    if (activeAssignment) {
      activeAssignment.status = 'Transferred';
      activeAssignment.returnDate = new Date();
      await activeAssignment.save();
    }

    // Provision new assignment
    const id = `assign-${Date.now()}`;
    await AssetAssignment.create({
      id,
      assetId,
      userId: targetEmployeeId,
      issueDate: new Date(),
      status: 'Active'
    });

    asset.assignedTo = targetEmployeeId;
    await asset.save();

    await logActivity(req.user.uid, req.user.name, 'Asset Transfer Event', `Transferred check-out of ${asset.name} to ${targetEmployee.name}`);

    res.json({ success: true, message: 'Asset transfer approved.' });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentHistory = async (req, res, next) => {
  try {
    const history = await AssetAssignment.findAll({
      include: [
        { model: Asset, as: 'asset', attributes: ['name', 'tag'] },
        { model: User, as: 'user', attributes: ['name', 'email'] }
      ],
      order: [['issueDate', 'DESC']]
    });
    res.json(history);
  } catch (error) {
    next(error);
  }
};
