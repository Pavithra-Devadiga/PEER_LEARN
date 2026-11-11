const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function getAuthToken() {
  return localStorage.getItem('peerlearn_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('peerlearn_token', token);
  } else {
    localStorage.removeItem('peerlearn_token');
  }
}

export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '';
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('peerlearn:unauthorized'));
    }
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function fetchAttachmentBlob(path) {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('peerlearn:unauthorized'));
    }
    throw new Error(`Could not load attachment (${response.status})`);
  }

  const blob = await response.blob();
  const contentType = response.headers.get('Content-Type') || blob.type || 'application/octet-stream';
  return { blob, contentType };
}
