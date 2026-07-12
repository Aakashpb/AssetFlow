import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import Role from '../models/Role.js';
import PasswordReset from '../models/PasswordReset.js';
import { logActivity } from '../utilities/logger.js';
import { sendResetPasswordEmail, sendVerificationEmail } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-assetflow-key-phrase';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req, res, next) => {
  const { name, email, password, employeeId, department } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uid = `user-${Date.now()}`;
    
    // Auto-create/sync Default Role as User
    let userRole = await Role.findOne({ where: { name: 'Employee' } });
    if (!userRole) {
      userRole = await Role.create({ id: 'role-emp', name: 'Employee' });
    }

    const user = await User.create({
      uid,
      name,
      email,
      password: hashedPassword,
      employeeId: employeeId || `EMP-${Date.now().toString().slice(-5)}`,
      department: department || 'IT Operations',
      roleId: userRole.id,
      provider: 'Email/Password',
      status: 'Active'
    });

    await logActivity(uid, name, 'User Account Registration', `Provisioned new user account: ${email}`);
    
    // Dispatch mock email verification
    const verifLink = `http://localhost:5173/#/verify-email?token=${uid}`;
    await sendVerificationEmail(email, name, verifLink);

    res.status(201).json({ success: true, message: 'User account created. Please verify your email.' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials. User does not exist.' });
    }

    if (user.status === 'Deactivated') {
      return res.status(403).json({ error: 'Access Forbidden: This corporate user profile has been deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    // Create JWT
    const token = jwt.sign(
      { uid: user.uid, role: user.role?.name || 'Employee', name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logActivity(user.uid, user.name, 'Sign In Success', `User logged in using provider: ${user.provider}`);

    res.json({
      success: true,
      token,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role?.name || 'Employee',
        avatar: user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
        profilePicture: user.profilePicture,
        provider: user.provider
      }
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  const { credential, email: mockEmail, name: mockName, department: mockDept } = req.body;

  try {
    let email = mockEmail;
    let name = mockName;

    // Secure Google ID Token Verification
    if (credential && process.env.GOOGLE_CLIENT_ID) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
      } catch (err) {
        console.error('Google ID token verification failed:', err.message);
        return res.status(400).json({ error: 'Invalid Google SSO token credentials.' });
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'Could not fetch email details from Google token.' });
    }

    let user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });

    const now = new Date();

    if (!user) {
      // First-time SSO user: Register account
      const uid = `google-${Date.now()}`;
      
      let userRole = await Role.findOne({ where: { name: 'Employee' } });
      if (!userRole) {
        userRole = await Role.create({ id: 'role-emp', name: 'Employee' });
      }

      const mockHashedPass = await bcrypt.hash('google-sso-bypass-key', 10);

      user = await User.create({
        uid,
        name,
        email,
        password: mockHashedPass,
        employeeId: `EMP-${Date.now().toString().slice(-5)}`,
        department: mockDept || 'IT Operations',
        roleId: userRole.id,
        provider: 'Google',
        status: 'Active',
        lastLoginAt: now
      });

      await logActivity(uid, name, 'Google SSO Account Registration', `SSO User registered: ${email}`);
    } else {
      if (user.status === 'Deactivated') {
        return res.status(403).json({ error: 'Access Forbidden: User account deactivated.' });
      }
      user.lastLoginAt = now;
      await user.save();
    }

    const token = jwt.sign(
      { uid: user.uid, role: user.role?.name || 'Employee', name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logActivity(user.uid, user.name, 'Google Sign In Success', `User logged in using Google SSO`);

    res.json({
      success: true,
      token,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role?.name || 'Employee',
        avatar: user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
        profilePicture: user.profilePicture,
        provider: user.provider
      }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Avoid revealing account enumeration
      return res.json({ success: true, message: 'Password recovery email dispatched.' });
    }

    const token = `reset-${Date.now()}-${Math.round(Math.random() * 100000)}`;
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    await PasswordReset.create({ email, token, expiry });

    const resetLink = `http://localhost:5173/#/reset-password?token=${token}&email=${email}`;
    await sendResetPasswordEmail(email, resetLink);

    res.json({ success: true, message: 'Password recovery email dispatched.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { email, token, newPassword } = req.body;

  try {
    const record = await PasswordReset.findOne({
      where: { email, token }
    });

    if (!record || new Date() > new Date(record.expiry)) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Remove token record
    await PasswordReset.destroy({ where: { id: record.id } });

    await logActivity(user.uid, user.name, 'Password Recovery Success', `Changed user credentials password`);

    res.json({ success: true, message: 'Credentials updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logActivity(req.user.uid, req.user.name, 'Sign Out Event', `Logged out user session`);
    }
    res.json({ success: true, message: 'Session terminated successfully.' });
  } catch (error) {
    next(error);
  }
};
