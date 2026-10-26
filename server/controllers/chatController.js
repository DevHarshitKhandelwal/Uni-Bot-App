import { getStore } from '../data/store.js';
import { generateContextualAnswer } from '../services/chatService.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { prompt, scope = 'all_resources', selectedSubject = '', sessionId } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Message prompt cannot be empty.' });
    }

    const userId = req.user ? req.user.id : 'guest_student';
    const store = getStore();

    // 1. Generate an answer through the RAG service.
    const { answer, citations, ragMode } = await generateContextualAnswer({
      prompt,
      userId,
      scope,
      selectedSubject,
    });

    // 2. Persist in ChatSession if session exists or create one
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const newSession = await store.chats.create({
        userId,
        title: prompt.slice(0, 36) + (prompt.length > 36 ? '...' : ''),
        scope,
        selectedSubject,
      });
      currentSessionId = newSession.id || newSession._id;
    }

    // Add user message
    await store.chats.addMessage(currentSessionId, userId, {
      sender: 'user',
      text: prompt,
      citations: [],
    });

    // Add assistant answer
    const updatedSession = await store.chats.addMessage(currentSessionId, userId, {
      sender: 'assistant',
      text: answer,
      citations,
    });

    res.json({
      success: true,
      data: {
        sessionId: currentSessionId,
        message: {
          sender: 'assistant',
          text: answer,
          citations,
          timestamp: new Date(),
        },
        ragMode,
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMySessions = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 'guest_student';
    const store = getStore();
    const sessions = await store.chats.findByUser(userId);
    res.json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
};

export const getSessionMessages = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 'guest_student';
    const store = getStore();
    const session = await store.chats.findById(req.params.id, userId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Chat session not found.' });
    }
    res.json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
};
