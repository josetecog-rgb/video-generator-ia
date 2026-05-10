import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const generateTopics  = (data) => api.post('/topics', data);
export const generateScript  = (data) => api.post('/scripts', data);
export const generateImage   = (data) => api.post('/images', data);
export const generateVideo   = (data) => api.post('/videos', data);
export const generateCaption = (data) => api.post('/captions', data);
export const getProjects     = ()     => api.get('/projects');
export const saveProject     = (data) => api.post('/projects', data);
export const updateProject   = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject   = (id)  => api.delete(`/projects/${id}`);
