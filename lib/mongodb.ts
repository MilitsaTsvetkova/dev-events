import mongoose from "mongoose";

// Define the MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI;

// Validate that the MONGODB_URI environment variable is defined
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Define TypeScript interface for the cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global object to include the mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Initialize the cache object
// In development, use a global variable to preserve the connection across hot reloads
// In production, the cache is scoped to this module
let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose
 * Caches the connection to prevent multiple connections during development hot reloads
 *
 * @returns Promise that resolves to the Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing connection promise if one is in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering
    };

    // Create a new connection promise
    cached.promise = mongoose.connect(MONGODB_URI as string, opts);
  }

  try {
    // Wait for the connection promise to resolve
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset the promise on error so subsequent calls can retry
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
