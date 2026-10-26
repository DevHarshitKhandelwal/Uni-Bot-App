import AiSettings from '../models/AiSettings.js';
import { getDBStatus } from '../config/db.js';

const SETTINGS_KEY = 'chat-provider';

export const getActiveProvider = async () => {
  if (getDBStatus().isMongoConnected) {
    const settings = await AiSettings.findOne({ key: SETTINGS_KEY }).lean();
    if (settings?.provider) return settings.provider;
  }

  return process.env.DEFAULT_AI_PROVIDER === 'openai' ? 'openai' : 'gemini';
};

export const saveActiveProvider = async (provider) => {
  if (!getDBStatus().isMongoConnected) {
    const error = new Error('MongoDB is required to save the AI provider setting.');
    error.status = 503;
    throw error;
  }

  const settings = await AiSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $set: { provider } },
    { new: true, upsert: true, runValidators: true },
  ).lean();
  return settings.provider;
};
