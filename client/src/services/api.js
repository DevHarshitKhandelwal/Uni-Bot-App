const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('unibot_token');
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

export const api = {
  // Auth
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });
      return handleResponse(res);
    },
    demoLogin: async () => {
      const res = await fetch(`${API_BASE}/auth/demo`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },

  // Resources (Academic Hub)
  resources: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/resources?${query}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/resources/${id}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (formData) => {
      const res = await fetch(`${API_BASE}/resources`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
      });
      return handleResponse(res);
    },
    toggleUpvote: async (id) => {
      const res = await fetch(`${API_BASE}/resources/${id}/upvote`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getDownloadUrl: (id) => `${API_BASE}/resources/${id}/download`,
  },

  // Assignments & Vault
  assignments: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/assignments`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (formData) => {
      const res = await fetch(`${API_BASE}/assignments`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
      });
      return handleResponse(res);
    },
    uploadFiles: async (id, formData) => {
      const res = await fetch(`${API_BASE}/assignments/${id}/files`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
      });
      return handleResponse(res);
    },
    updateStatus: async (id, status, priority, notes) => {
      const res = await fetch(`${API_BASE}/assignments/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status, priority, notes }),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/assignments/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getFileDownloadUrl: (id, fileName) => `${API_BASE}/assignments/${id}/download/${encodeURIComponent(fileName)}`,
  },

  // StudyBot / Chat
  chat: {
    sendMessage: async ({ prompt, scope, selectedSubject, sessionId }) => {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ prompt, scope, selectedSubject, sessionId }),
      });
      return handleResponse(res);
    },
    getSessions: async () => {
      const res = await fetch(`${API_BASE}/chat/sessions`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getSession: async (id) => {
      const res = await fetch(`${API_BASE}/chat/sessions/${id}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },

  // System Health
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  }
};
