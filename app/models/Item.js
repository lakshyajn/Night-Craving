// app/models/Item.js
import mongoose from 'mongoose';

const addonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  section: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  addons: [addonSchema]
});

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);
export default Item;