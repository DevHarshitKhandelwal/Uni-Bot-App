import mongoose from 'mongoose';

const aiSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  provider: {
    type: String,
    enum: ['gemini', 'openai'],
    required: true,
  },
}, { timestamps: true });

const AiSettings = mongoose.models.AiSettings
  || mongoose.model('AiSettings', aiSettingsSchema);

export default AiSettings;
