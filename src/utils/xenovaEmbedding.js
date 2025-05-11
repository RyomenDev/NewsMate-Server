import { pipeline } from "@xenova/transformers";
import fs from "fs";
import { fetchNewsFromRSS } from "./rssReader.js";
import { qdrant, COLLECTION_NAME } from "../services/qdrantClient.js";
import { ensureCollectionExists } from "../services/qdrantClient.js";
// import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

let extractor;

const loadModel = async () => {
  if (!extractor) {
    // console.log("🧠 Loading embedding model...");
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    // console.log("✅ Embedding model loaded.");
  }
};

// const hashLink = (link) =>
//   crypto.createHash("sha256").update(link).digest("hex");
const hashLinkToUUID = (link) => {
  const hash = crypto.createHash("sha256").update(link).digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32),
  ].join("-");
};

const isArticleNew = async (link) => {
  try {
    const id = hashLinkToUUID(link);
    const result = await qdrant.retrieve(COLLECTION_NAME, {
      ids: [id],
      with_payload: false,
    });
    return result.length === 0; // true if not found
  } catch (error) {
    console.error("❌ Error checking article existence:", error.message);
    return false;
  }
};
// Generate and upload embeddings to Qdrant
export const generateEmbeddings = async () => {
  try {
    await loadModel();
    const articles = await fetchNewsFromRSS();
    // console.log(`📰 Fetched ${articles.length} articles`);

    const embeddedArticles = [];

    for (const article of articles) {
      const isNew = await isArticleNew(article.link);
      if (!isNew) {
        // console.log(`⚠️ Skipping duplicate: ${article.title}`);
        continue;
      }

      try {
        const embedding = await extractor(article.content, {
          pooling: "mean",
          normalize: true,
        });

        const vector = Array.from(embedding.data);
        const id = hashLinkToUUID(article.link);
        const point = {
          //   id: article.link,
          //   id: uuidv4(),
          id,
          payload: {
            title: article.title,
            link: article.link,
            content: article.content,
          },
          vector,
        };

        await ensureCollectionExists();

        const upsertResponse = await qdrant.upsert(COLLECTION_NAME, {
          wait: true,
          points: [point],
        });

        // console.log(`📌 Uploaded: ${article.title}`, upsertResponse);

        embeddedArticles.push({ ...point.payload, embedding: vector });
      } catch (articleError) {
        console.error(
          `❌ Error processing article: ${article.title}`,
          articleError
        );
      }
    }

    // if (embeddedArticles.length > 0) {
    //   fs.writeFileSync(
    //     "embeddings.json",
    //     JSON.stringify(embeddedArticles, null, 2)
    //   );
    // //   console.log("✅ Saved new embeddings locally and uploaded to Qdrant");
    // } else {
    // //   console.log("ℹ️ No new articles to embed.");
    // }
  } catch (error) {
    console.error("❌ Failed to generate embeddings:", error.message);
  }
};

// Search Qdrant for similar documents
export const searchQdrant = async (query) => {
  try {
    await ensureCollectionExists();
    // console.log("🔍 Searching Qdrant for:", query);
    await loadModel();

    const embedding = await extractor(query, {
      pooling: "mean",
      normalize: true,
    });

    const vector = Array.from(embedding.data);
    // console.log("📐 Generated query embedding.");

    const result = await qdrant.search(COLLECTION_NAME, {
      vector,
      top: 15,
      with_payload: true,
    });

    // console.log(`🔎 Found ${result.length} matching documents.`);
    // console.log({result});

    return result.map((item) => item.payload?.content || "").filter(Boolean);
  } catch (error) {
    console.error(
      "❌ Qdrant search failed:",
      error?.response?.data || error.message
    );
    return [];
  }
};
