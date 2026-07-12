import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  icon: {
    type: String,
    required: true
  }
}, {
  timestamps: false,
  collection: 'categories'
});

const Category = mongoose.model('Category', CategorySchema);
export default Category;
