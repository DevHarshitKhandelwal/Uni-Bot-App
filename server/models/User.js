import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'class_rep', 'admin'],
    default: 'student',
  },
  institution: {
    type: String,
    default: 'National Institute of Technology',
  },
  department: {
    type: String,
    default: 'Computer Science & Engineering',
  },
  semester: {
    type: Number,
    default: 4,
  },
  studentId: {
    type: String,
    default: () => 'STU-' + Math.floor(100000 + Math.random() * 900000),
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
