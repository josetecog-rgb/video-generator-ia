const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  platform: { type: String, required: true },
  niche: String,
  topic: String,
  script: {
    hook: String,
    development: String,
    cta: String,
    full_script: String,
  },
  images: [{ url: String, prompt: String }],
  video: { url: String, status: String },
  status: {
    type: String,
    enum: ['draft', 'generating', 'ready', 'published'],
    default: 'draft',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Project', projectSchema);
