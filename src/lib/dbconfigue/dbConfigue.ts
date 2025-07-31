import mongoose from "mongoose";

let isConnected = false;

type ConnectionState = {
  isConnecting: boolean;
  connectPromise: Promise<void> | null;
};

const connectionState: ConnectionState = {
  isConnecting: false,
  connectPromise: null,
};

export async function connect(): Promise<void> {
  try {
    if (isConnected && mongoose.connection.readyState === 1) {
      console.log('Using existing MongoDB connection');
      return;
    }

    if (connectionState.isConnecting && connectionState.connectPromise) {
      return connectionState.connectPromise;
    }

    const mongoUrl = process.env.MONGODB_URI;
    if (!mongoUrl) {
      throw new Error("MONGO_URL is not defined in the environment variables");
    }

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 30000,
      family: 4
    } as mongoose.ConnectOptions;

    connectionState.isConnecting = true;
    connectionState.connectPromise = (async () => {
      let retries = 3;
      while (retries > 0) {
        try {
          await mongoose.connect(mongoUrl, options);
          break;
        } catch (error) {
          retries -= 1;
          if (retries === 0) throw error;
          console.log(`Failed to connect to MongoDB. Retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    })();

    await connectionState.connectPromise;

    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("MongoDB connected successfully");
      isConnected = true;
      connectionState.isConnecting = false;
      connectionState.connectPromise = null;
    });

    connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      isConnected = false;
      connectionState.isConnecting = false;
      connectionState.connectPromise = null;
    });

    connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      isConnected = false;
      connectionState.isConnecting = false;
      connectionState.connectPromise = null;
    });

    connection.on("timeout", () => {
      console.error("MongoDB connection timed out");
      isConnected = false;
      connectionState.isConnecting = false;
      connectionState.connectPromise = null;
    });

    // REMOVED: process.on('SIGINT') handler which is not supported in Edge Runtime

  } catch (error) {
    connectionState.isConnecting = false;
    connectionState.connectPromise = null;
    console.error("Failed to connect to MongoDB:", error);
    isConnected = false;
    throw error;
  }
}

// Check connection status with enhanced state checking
export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

// Enhanced close connection function
export async function closeConnection(): Promise<void> {
  if (isDbConnected()) {
    try {
      await mongoose.connection.close();
      isConnected = false;
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }
}

// Enhanced error type
export interface MongoDBError extends Error {
  code?: number;
  syscall?: string;
  hostname?: string;
  connectionGeneration?: string;
  cause?: Error;
}