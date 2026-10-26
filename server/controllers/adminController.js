import { getRagStatus } from '../services/chatService.js';
import {
  getActiveProvider,
  saveActiveProvider,
} from '../services/aiSettingsService.js';

export const getAiSettings = async (_req, res, next) => {
  try {
    const [provider, rag] = await Promise.all([
      getActiveProvider(),
      getRagStatus(),
    ]);

    res.json({
      success: true,
      data: {
        activeProvider: provider,
        providers: rag.providers,
        ragReady: rag.ready,
        retrievalMode: rag.retrievalMode || 'unknown',
        quotaStatus: rag.quotaStatus || 'unknown',
        providerStatus: rag.providerStatus || {},
        message: rag.message,
        creditBalance: 'unavailable',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAiProvider = async (req, res, next) => {
  try {
    const { provider } = req.body || {};
    if (!['gemini', 'openai'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Provider must be gemini or openai.',
      });
    }

    const rag = await getRagStatus();
    if (!rag.providers?.[provider]) {
      return res.status(400).json({
        success: false,
        message: `${provider} is not configured in the RAG service. Add its API key in Render first.`,
      });
    }

    const activeProvider = await saveActiveProvider(provider);
    return res.json({
      success: true,
      data: { activeProvider },
    });
  } catch (error) {
    return next(error);
  }
};
