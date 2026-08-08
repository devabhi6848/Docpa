import mongoose from "mongoose";
import { config } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`[DATABASE] MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DATABASE ERROR] MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("[DATABASE WARNING] MongoDB connection lost. Reconnecting...");
});

mongoose.connection.on("error", (err) => {
  console.error(`[DATABASE ERROR] MongoDB connection error: ${err.message}`);
});
