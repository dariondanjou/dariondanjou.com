const mongoose = require("mongoose");

let cached = global.__mongooseCache;
if (!cached) {
  cached = global.__mongooseCache = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 1,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectToDatabase;
