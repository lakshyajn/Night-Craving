import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a section name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Section name cannot be more than 50 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Section || mongoose.model('Section', SectionSchema);