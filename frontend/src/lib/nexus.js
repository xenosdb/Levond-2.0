import client, { API } from './api';

export const nexusApi = {
  agents: () => client.get('/nexus/agents').then((r) => r.data),
  sessions: () => client.get('/nexus/sessions').then((r) => r.data),
  getSession: (id) => client.get(`/nexus/sessions/${id}`).then((r) => r.data),
  chat: (message, session_id = null, force_agent = null) =>
    client.post('/nexus/chat', { message, session_id, force_agent }).then((r) => r.data),
  feedback: (message_id, rating, correction = '') =>
    client.post('/nexus/feedback', { message_id, rating, correction }).then((r) => r.data),
  activities: () => client.get('/nexus/activities').then((r) => r.data),
  dismiss: (id) => client.post(`/nexus/activities/${id}/dismiss`).then((r) => r.data),
  generateProactive: () => client.post('/nexus/proactive/generate').then((r) => r.data),
  metrics: () => client.get('/nexus/metrics').then((r) => r.data),
  uploadDoc: (file, session_id) => {
    const fd = new FormData();
    fd.append('file', file);
    if (session_id) fd.append('session_id', session_id);
    return client.post('/nexus/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  listDocs: (sid) => client.get(`/nexus/sessions/${sid}/documents`).then((r) => r.data),
  deleteDoc: (id) => client.delete(`/nexus/documents/${id}`).then((r) => r.data),
};
