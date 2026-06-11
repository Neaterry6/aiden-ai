import mongoose from "mongoose";
import logger from "../utils/logger";

const MONGODB_URL =
  process.env.DATABASE_URL ||
  "mongodb://localhost:27017/aiden";

async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URL, {
      retryWrites: true,
      w: "majority",
    });
    logger.info("✅ MongoDB connected");
  } catch (err) {
    logger.error("❌ MongoDB connection failed:", err);
    // Retry after 5 seconds
    setTimeout(connectMongoDB, 5000);
  }
}

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB error:", err);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

export { connectMongoDB };
export default mongoose;
