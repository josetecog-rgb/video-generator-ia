const mongoose = require('mongoose');

let cached = global._mongoConnection;

async function connectDB() {
  if (cached && cached.conn) return cached.conn;
  if (!process.env.MONGODB_URI) return null;

  if (!cached) {
    cached = global._mongoConnection = { conn: null, promise: null };
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
