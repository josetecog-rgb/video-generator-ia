import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const generateTopics = (data) => api.post('/topics/generate', data);
export const generateScript = (data) => api.post('/scripts/generate', data);
export const generateImage = (data) => api.post('/images/generate', data);
export const generateVideo = (data) => api.post('/videos/generate', data);
export const getProjects = () => api.get('/projects');
export const saveProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
