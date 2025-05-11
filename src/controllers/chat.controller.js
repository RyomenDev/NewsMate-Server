import redisClient from "../services/redisClient.js"; // updated path & import
import { v4 as uuidv4 } from "uuid";
import { getBotResponse } from "../services/gemini.service.js";

// GET /session — Generate new session ID
export const createSession = (req, res) => {
  //   console.log("createSession");
  //   const sessionId = uuidv4();
  //   res.status(200).json({ sessionId });
};

// POST /chat — Handle user message and get bot response
export const sendMessage = async (req, res) => {
  const { message, sessionId } = req.body;
  //   console.log("SendMessage", message);

  if (!message || !sessionId) {
    return res
      .status(400)
      .json({ message: "Message and sessionId are required." });
  }

  try {
    const botReply = await getBotResponse(message);

    const sessionKey = `session:${sessionId}`;
    const newEntry = JSON.stringify({ user: message, bot: botReply });

    await redisClient.rPush(sessionKey, newEntry);
    await redisClient.expire(sessionKey, 3600); // 1 hour TTL

    res.status(200).json({ response: botReply });
  } catch (error) {
    console.error("❌ Error in sendMessage:", error);
    res.status(500).json({ message: "Failed to get response from bot." });
  }
};

// GET /history/:sessionId — Retrieve chat history
export const getHistory = async (req, res) => {
  const { sessionId } = req.params;
  //   console.log("Get History", sessionId);
  const sessionKey = `session:${sessionId}`;

  try {
    const history = await redisClient.lRange(sessionKey, 0, -1);
    const parsed = history.map((entry) => JSON.parse(entry));
    res.status(200).json(parsed);
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json({ message: "Failed to fetch session history." });
  }
};

// POST /reset — Clear session
export const resetSession = async (req, res) => {
  //   console.log("Reset Session");

  const { sessionId } = req.body;
  const sessionKey = `session:${sessionId}`;

  try {
    await redisClient.del(sessionKey);
    res.status(200).json({ message: "Session reset successfully." });
  } catch (error) {
    console.error("❌ Error resetting session:", error);
    res.status(500).json({ message: "Failed to reset session." });
  }
};

// import redisClient from "../services/redisClient.js";
// import { v4 as uuidv4 } from "uuid";
// import { getBotResponse } from "../services/gemini.service.js";
// // import { qdrant } from "../services/qdrantClient.js"; // Optional: for RAG logic
// // import { generateEmbeddings } from "../utils/xenovaEmbedding.js";

// // GET /session — Generate a new session ID
// export const createSession = (req, res) => {
//   const sessionId = uuidv4();
//   console.log("🎯 New session created:", sessionId);
//   res.status(200).json({ sessionId });
// };

// // POST /chat — Handle user message and get bot response
// export const sendMessage = async (req, res) => {
//   const { message, sessionId } = req.body;
//   console.log("📩 Received message:", message);

//   if (!message || !sessionId) {
//     return res
//       .status(400)
//       .json({ message: "Message and sessionId are required." });
//   }

//   try {
//     // Step 1: Get bot response (you can enhance this with Qdrant + Gemini RAG)
//     const botReply = await getBotResponse(message);

//     // Step 2: Save chat in Redis
//     const sessionKey = `session:${sessionId}`;
//     const newEntry = JSON.stringify({ user: message, bot: botReply });

//     await redisClient.rPush(sessionKey, newEntry);
//     await redisClient.expire(sessionKey, 3600); // Expire in 1 hour

//     // Step 3: Respond to frontend
//     res.status(200).json({ response: botReply });
//   } catch (error) {
//     console.error("❌ Error in sendMessage:", error);
//     res.status(500).json({ message: "Failed to get response from bot." });
//   }
// };

// // GET /history/:sessionId — Retrieve session history
// export const getHistory = async (req, res) => {
//   const { sessionId } = req.params;
//   const sessionKey = `session:${sessionId}`;
//   console.log("📜 Fetching history for", sessionId);

//   try {
//     const history = await redisClient.lRange(sessionKey, 0, -1);
//     const parsed = history.map((entry) => JSON.parse(entry));
//     res.status(200).json(parsed);
//   } catch (error) {
//     console.error("❌ Error fetching history:", error);
//     res.status(500).json({ message: "Failed to fetch session history." });
//   }
// };

// // POST /reset — Clear session history
// export const resetSession = async (req, res) => {
//   const { sessionId } = req.body;
//   const sessionKey = `session:${sessionId}`;
//   console.log("♻️ Resetting session:", sessionId);

//   try {
//     await redisClient.del(sessionKey);
//     res.status(200).json({ message: "Session reset successfully." });
//   } catch (error) {
//     console.error("❌ Error resetting session:", error);
//     res.status(500).json({ message: "Failed to reset session." });
//   }
// };
