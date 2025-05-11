import axios from "axios";
import { searchQdrant } from "../utils/xenovaEmbedding.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

export const getBotResponse = async (userPrompt) => {
  try {
    // console.log("📨 User Prompt:", userPrompt);

    const contextChunks = await searchQdrant(userPrompt);
    // console.log("📚 Context Chunks Retrieved:", contextChunks.length);
    // console.log({contextChunks});

    const cleanedChunks = contextChunks
      .filter(Boolean)
      .map((chunk) => chunk.trim())
      .slice(0, 50);

    const contextText = cleanedChunks.length
      ? `Use the following context to answer the question:\n\n${cleanedChunks.join(
          "\n\n"
        )}`
      : "";

    const prompt = `${contextText}\n\nQuestion: ${userPrompt}`.trim();

    // console.log("🧠 Final Prompt (length):", prompt.length);
    if (prompt.length > 8000) {
      console.warn(
        "⚠️ Prompt too long. Consider truncating more aggressively."
      );
    }
    // console.log({ prompt });

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    // console.log("🤖 Gemini Response:", answer);
    return answer || "I'm not sure how to answer that.";
  } catch (error) {
    console.error(
      "❌ Gemini API Error:",
      error?.response?.data || error.message
    );
    throw new Error("Failed to get response from Gemini API.");
  }
};

// import axios from "axios";

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// const GEMINI_API_URL =
//   "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

// export const getBotResponse = async (userPrompt, contextChunks = []) => {
//   try {
//     const contextText = contextChunks.length
//       ? `Use the following context to answer the question:\n\n${contextChunks.join(
//           "\n\n"
//         )}`
//       : "";

//     const prompt = `${contextText}\n\nQuestion: ${userPrompt}`;
//     console.log(prompt);

//     const response = await axios.post(
//       `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
//       {
//         contents: [
//           {
//             role: "user",
//             parts: [{ text: prompt }],
//           },
//         ],
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // console.log(response.data.candidates[0].content);

//     const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
//     // console.log(answer);

//     return answer || "I'm not sure how to answer that.";
//   } catch (error) {
//     console.error("Gemini API Error:", error?.response?.data || error.message);
//     throw new Error("Failed to get response from Gemini API.");
//   }
// };
