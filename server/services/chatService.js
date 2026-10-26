import { getStore } from '../data/store.js';

const getRagServiceUrl = () => {
  const configuredUrl = process.env.RAG_SERVICE_URL || 'http://localhost:8000';
  const normalizedUrl = /^https?:\/\//i.test(configuredUrl)
    ? configuredUrl
    : `https://${configuredUrl}`;
  return normalizedUrl.replace(/\/+$/, '');
};

const requestRag = async (path, options = {}, timeoutMs = 5000) => {
  try {
    return await fetch(`${getRagServiceUrl()}${path}`, {
      ...options,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    error.status = 503;
    throw error;
  }
};

export const getRagStatus = async () => {
  try {
    const response = await requestRag('/health');
    if (!response.ok) {
      return { ready: false, mode: 'Unavailable', message: `RAG service returned HTTP ${response.status}` };
    }

    const status = await response.json();
    return {
      ready: status.ready === true,
      mode: status.ready === true ? 'Active Vector Search + RAG LLM' : 'Unavailable',
      message: status.message || '',
    };
  } catch (error) {
    return { ready: false, mode: 'Unavailable', message: error.message };
  }
};

export const generateContextualAnswer = async ({ prompt, userId, scope = 'all_resources', selectedSubject = '' }) => {
  const store = getStore();
  const supplementalContext = [];
  if (userId && scope === 'my_vault') {
    const userAssignments = await store.assignments.findByUser(userId);
    for (const assignment of userAssignments) {
      if (supplementalContext.length >= 25) break;
      supplementalContext.push({
        source: `Assignment: ${assignment.title}`,
        page: null,
        fileUrl: assignment.files?.[0]?.fileUrl || '',
        content: [
          `Subject: ${assignment.subjectName}`,
          `Description: ${assignment.description}`,
          `Notes: ${assignment.notes}`,
          `Due date: ${assignment.dueDate || 'Not set'}`,
          `Status: ${assignment.status}`,
          `Priority: ${assignment.priority}`,
        ].filter(Boolean).join('\n').slice(0, 3000),
      });

      for (const file of assignment.files || []) {
        if (supplementalContext.length >= 25) break;
        if (file.textPreview) {
          supplementalContext.push({
            source: file.fileName,
            page: null,
            fileUrl: file.fileUrl || '',
            content: file.textPreview.slice(0, 3000),
          });
        }
      }
    }
  }

  const response = await requestRag('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: prompt,
      scope,
      selectedSubject,
      supplementalContext: scope === 'my_vault' ? supplementalContext : [],
    }),
  }, Number(process.env.RAG_REQUEST_TIMEOUT_MS) || 600000);

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.detail || `RAG service returned HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const citations = (result.sources || []).map(source => ({
    title: source.source || 'University knowledge base',
    sourceType: scope === 'my_vault' ? 'assignment' : 'resource',
    pageOrSection: source.page ? `Page ${source.page}` : (scope === 'my_vault' ? 'Student Vault' : 'University knowledge base'),
    snippet: source.snippet || '',
    fileUrl: source.fileUrl || (scope === 'my_vault' || !source.source
      ? ''
      : `/uploads/samples/${encodeURIComponent(source.source)}`),
  }));

  return {
    answer: result.answer,
    citations,
    ragMode: 'Active Vector Search + RAG LLM',
  };
};
