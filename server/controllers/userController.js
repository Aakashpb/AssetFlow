import User from '../models/User.js';
import Role from '../models/Role.js';
import { logActivity } from '../utilities/logger.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }]
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.uid, {
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  const { name, department } = req.body;

  try {
    const user = await User.findByPk(req.user.uid);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    user.name = name !== undefined ? name : user.name;
    user.department = department !== undefined ? department : user.department;
    await user.save();

    await logActivity(user.uid, user.name, 'Profile Update Event', `Modified profile coordinates`);

    res.json({ success: true, user: { uid: user.uid, name: user.name, email: user.email, department: user.department } });
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePic = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file.' });
    }

    const user = await User.findByPk(req.user.uid);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const relativePath = `/uploads/profile_pictures/${req.file.filename}`;
    user.profilePicture = relativePath;
    await user.save();

    await logActivity(user.uid, user.name, 'Profile Picture Upload', `Uploaded profile picture: ${relativePath}`);

    res.json({ success: true, profilePicture: relativePath });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  const { uid } = req.params;
  const { status } = req.body; // Active or Deactivated

  try {
    const user = await User.findByPk(uid);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    user.status = status;
    await user.save();

    await logActivity(req.user.uid, req.user.name, 'User Deactivation toggle', `Changed status of ${user.email} to: ${status}`);

    res.json({ success: true, status: user.status });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const { uid } = req.params;

  try {
    const user = await User.findByPk(uid);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    await user.destroy(); // Soft delete active user

    await logActivity(req.user.uid, req.user.name, 'User Deletion Event', `Soft deleted user profile UID: ${uid}`);

    res.json({ success: true, message: 'User profile soft-deleted.' });
  } catch (error) {
    next(error);
  }
};
