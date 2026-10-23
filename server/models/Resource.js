import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  subjectCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  subjectName: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  department: {
    type: String,
    default: 'Computer Science & Engineering',
  },
  category: {
    type: String,
    enum: ['lecture_note', 'pyq', 'lab_manual', 'syllabus', 'cheatsheet'],
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  fileType: {
    type: String,
    default: 'application/pdf',
  },
  contentSnippet: {
    type: String,
    default: '',
  },
  uploadedBy: {
    type: String,
    default: 'Academic Faculty / Class Rep',
  },
  uploaderId: {
    type: String,
  },
  upvotes: {
    type: [String], // user IDs
    default: [],
  },
  downloadsCount: {
    type: Number,
    default: 0,
  },
  tags: {
    type: [String],
    default: [],
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
export default Resource;
