## 📡 API Endpoint Summary

`GET /session`

- Purpose: Generate and return a new unique session ID.
- Used for: Initiating a fresh chat session. The session ID helps track conversation context using Redis.
- Response: { sessionId: <unique_id> }

`POST /chat`

- Purpose: Accepts a user query and returns a response from the bot.
- Workflow:

  - Embeds the user question.
  - Performs a similarity search in Qdrant to retrieve relevant news articles.
  - Builds a prompt using retrieved context.
  - Sends the prompt to Gemini and returns the response.

- Expected body:

```json
{
  "message": "What happened in the Middle East?",
  "sessionId": "<session_id>"
}
```

`GET /history/:sessionId`

- Purpose: Retrieve the full message history for a given session ID.
- Used for: Resuming past sessions or displaying previous interactions in the frontend chat UI.

`POST /reset`

- Purpose: Clear all cached messages and context for a session.
- Expected body:

```json
{
  "sessionId": "<session_id>"
}
```

- Effect: Deletes Redis keys related to that session.
