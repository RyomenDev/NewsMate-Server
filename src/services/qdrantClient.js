import { QdrantClient } from "@qdrant/js-client-rest";

const qdrant = new QdrantClient({
  url: process.env.QDRANT_ACCESS_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = "news_articles";

const ensureCollectionExists = async () => {
  try {
    // console.log("now in quant client");
    await qdrant.getCollection(COLLECTION_NAME);
    // console.log(`✅ Collection "${COLLECTION_NAME}" already exists.`);
    // console.log("🔢 Points in Qdrant:", stats.points_count); console.log("Collection status:", stats.status);
  } catch (error) {
    if (error.status === 404) {
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 384, // for MiniLM
          distance: "Cosine",
        },
      });
      //   console.log(`✅ Collection "${COLLECTION_NAME}" created.`);
    } else {
      console.error("❌ Error checking/creating collection:", error);
    }
  }
};

export { qdrant, ensureCollectionExists, COLLECTION_NAME };
