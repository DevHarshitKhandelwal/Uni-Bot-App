import mongoose from 'mongoose';

const citationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sourceType: { type: String, enum: ['resource', 'assignment', 'syllabus'], default: 'resource' },
  pageOrSection: { type: String, default: 'Page 1' },
  snippet: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
});

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  citations: [citationSchema],
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: 'New Study Conversation',
  },
  scope: {
    type: String,
    enum: ['all_resources', 'my_vault', 'specific_subject'],
    default: 'all_resources',
  },
  selectedSubject: {
    type: String,
    default: '',
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', chatSessionSchema);
export default ChatSession;
