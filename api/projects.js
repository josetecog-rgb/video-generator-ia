const mongoose = require('mongoose');
const connectDB = require('./_services/db');

const ProjectSchema = new mongoose.Schema({
  title: String,
  platform: String,
  niche: String,
  topic: String,
  script: { hook: String, development: String, cta: String, full_script: String },
  images: [{ url: String, prompt: String }],
  video: { url: String, status: String },
  status: { type: String, default: 'draft' },
  createdAt: { type: Date, default: Date.now },
});

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectDB();

  if (req.method === 'GET') {
    const projects = await Project.find().sort({ createdAt: -1 }).limit(50);
    return res.json(projects);
  }

  if (req.method === 'POST') {
    const project = new Project(req.body);
    await project.save();
    return res.status(201).json(project);
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const project = await Project.findByIdAndUpdate(id, req.body, { new: true });
    return res.json(project);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    await Project.findByIdAndDelete(id);
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Método no permitido' });
};
