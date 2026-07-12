import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: false,
  collection: 'roles'
});

const Role = mongoose.model('Role', RoleSchema);
export default Role;
