import mongoose from 'mongoose';

const fileItemSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  storedFileName: {
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
  mimeType: {
    type: String,
    default: 'application/pdf',
  },
  textPreview: {
    type: String,
    default: '',
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  }
});

const assignmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subjectName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  dueDate: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  },
  files: [fileItemSchema],
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
export default Assignment;
