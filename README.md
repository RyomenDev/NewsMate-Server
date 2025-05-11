# 🧠 NewsMate Backend - RAG Chatbot for News Articles

This is the **backend** for **NewsMate**, a full-stack AI chatbot that answers questions based on real-time news using **Retrieval-Augmented Generation (RAG)**. The backend handles RSS ingestion, embedding generation, vector indexing in Qdrant, chat session tracking in Redis, and API interaction with Gemini.

---

## 📦 Tech Stack

- **Node.js** + **Express** – REST API & scheduling
- **@xenova/transformers** – Local embedding generation (MiniLM)
- **Qdrant Cloud** – Vector DB for semantic search
- **Redis** – Session-based caching and history management
- **Gemini API** – LLM response generation

---

## 📈 Embedding Workflow

### 🔁 1. RSS Feed Ingestion

- Periodically fetches news articles via RSS (NYTimes, etc.).
- Extracts `title`, `link`, and `content`.

### 🧠 2. Embedding Generation

- Uses `@xenova/transformers` pipeline (`all-MiniLM-L6-v2`) for dense vector generation.
- Pools the output and normalizes it (`mean pooling`).

### 🔐 3. Deduplication via Hashing

- Each article’s `link` is hashed (SHA-256) and formatted to a UUID-like string.
- This hash is used as a **unique ID** for Qdrant indexing.
- Before embedding, checks if the article already exists via `qdrant.retrieve()`.

### 📥 4. Vector Storage in Qdrant

- Embeddings are **upserted** to Qdrant’s `news_articles` collection with:
  - `id` (UUID from link hash)
  - `payload`: title, link, content
  - `vector`: dense embedding array

---

## 🧠 Chat & RAG Pipeline

### 📤 1. User Query

- The frontend sends a user query to `/chat` via REST or WebSocket.
- Server performs **semantic search** in Qdrant using the query embedding.

### 📚 2. Context Retrieval

- Top relevant articles (based on cosine similarity) are retrieved from Qdrant.
- Only key context chunks (e.g., title + summary) are selected and cleaned.

### 🤖 3. Gemini Response

- Retrieved chunks are inserted into the prompt.
- Gemini API generates a grounded answer.

---

## 🧠 Redis: Caching & Sessions

- A Redis store maintains **chat session history** (context window per user).
- Each session ID (socket or token-based) maps to:
  - Previous messages
  - Chat state
- Helps maintain **conversational memory** for follow-ups.

---

## 🔌 API & Socket Interaction

### ✅ REST Endpoints

| Route                 | Method | Description                                                                 |
| --------------------- | ------ | --------------------------------------------------------------------------- |
| `/session`            | GET    | Generate and return a new unique session ID.                                |
| `/chat`               | POST   | Accept user message, retrieve context, call Gemini API, and return a reply. |
| `/history/:sessionId` | GET    | Retrieve chat history from Redis for a specific session ID.                 |
| `/reset`              | POST   | Clear all session data (messages + context) for the given session ID.       |

<!-- | `/articles`           | GET    | Fetch raw news articles from all configured RSS feeds.                      |
| `/embed`              | POST   | Trigger manual re-embedding of latest fetched articles into Qdrant.         | -->

### 💬 WebSocket Events (Optional)

- `user_message` → User sends a query
- `bot_reply` → Server returns Gemini's answer
- Allows real-time interaction on the frontend

---

## ⚙️ Noteworthy Design Decisions

- 🔐 **UUID Hashing for Deduplication**: Prevents re-indexing of the same articles and ensures Qdrant ID format compliance.
- 🔄 **Local Embedding with Xenova**: Avoids external APIs, reduces latency and cost.
- 🧵 **Redis-backed Sessions**: Enables stateful multi-turn conversations and easy scaling with expiry.
- 📄 **Context Cleanup & Chunking**: Limits context to top-N cleaned, deduplicated chunks for optimal prompt size.

---

## 🚀 Future Improvements

- Add OpenTelemetry for performance tracing
- Implement queue-based ingestion for scaling
- Add user authentication & persistent session memory
- Rate limit Gemini API to prevent abuse
- Add UI for managing vector collection and logs

---

## 📁 Directory Overview

```bash
server/
├── src/
│   ├── services/
│   │   ├── qdrantClient.js       # Qdrant vector store utilities
│   │   └── redisClient.js        # Redis session manager
│   │   └── gemini.service.js     # Gemini Service manager
│   ├── utils/
│   │   ├── embeddingScheduler.js # Scheduler for periodic embeddings
│   │   ├── xenovaEmbedding.js    # Embedding generator logic
│   │   └── rssReader.js          # RSS parser
│   │   └── redisClient.js        # Redis Client
│   ├── routes/
│   │   └── chat.js               # Chat route (RAG entry point)
│   └── index.js                 # App bootstrap
├── embeddings.json              # Locally cached embedding dump
```

## 🧪 Running Locally

- Install dependencies

```bash
npm install
```

- Configure .env

```env
PORT=3000
CORS_ORIGIN1=""
CORS_ORIGIN2=""
CORS_ORIGIN3=""

REDIS_URL=""
GEMINI_API_KEY=""


QDRANT_API_KEY=""
QDRANT_ACCESS_URL=""
EMBED_REFRESH_INTERVAL_MS="21600000" # 6 hrs
```

- Start the server

```bash
npm run dev
```
