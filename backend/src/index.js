require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const topicsRouter = require('./routes/topics');
const scriptsRouter = require('./routes/scripts');
const imagesRouter = require('./routes/images');
const videosRouter = require('./routes/videos');
const projectsRouter = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/topics', topicsRouter);
app.use('/api/scripts', scriptsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/videos', videosRouter);
app.use('/api/projects', projectsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB conectado'))
    .catch(err => console.error('❌ Error MongoDB:', err.message));
}

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
