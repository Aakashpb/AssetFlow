import mongoose from 'mongoose';

const PasswordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiry: {
    type: Date,
    required: true
  }
}, {
  timestamps: true,
  collection: 'password_resets'
});

const PasswordReset = mongoose.model('PasswordReset', PasswordResetSchema);
export default PasswordReset;
