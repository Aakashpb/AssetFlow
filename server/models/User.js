import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  department: {
    type: String,
    required: true,
    default: 'IT Operations'
  },
  roleId: {
    type: String,
    required: true,
    default: 'role-emp'
  },
  status: {
    type: String,
    required: true,
    default: 'Active' // Active or Deactivated
  },
  provider: {
    type: String,
    required: true,
    default: 'Email/Password' // Email/Password or Google
  },
  profilePicture: {
    type: String,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'users'
});

const User = mongoose.model('User', UserSchema);
export default User;
