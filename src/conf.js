import dotenv from "dotenv";
dotenv.config();

const conf = {
  PORT: process.env.PORT || "3000",
  CORS_ORIGIN1: process.env.CORS_ORIGIN1 || "",
  CORS_ORIGIN2: process.env.CORS_ORIGIN2 || "",
  CORS_ORIGIN3: process.env.CORS_ORIGIN3 || "",
  REDIS_URL: process.env.REDIS_URL || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  QDRANT_API_KEY: process.env.QDRANT_API_KEY || "",
  EMBED_REFRESH_INTERVAL_MS: process.env.EMBED_REFRESH_INTERVAL_MS || "",
  QDRANT_ACCESS_URL: process.env.QDRANT_ACCESS_URL || "",
};

export default conf;
