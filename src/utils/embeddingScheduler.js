import Bottleneck from "bottleneck";
import { generateEmbeddings } from "./xenovaEmbedding.js";

const INTERVAL_MS = parseInt(
  process.env.EMBED_REFRESH_INTERVAL_MS || "43200000", // 12 hrs
  10
);

export const startEmbeddingScheduler = () => {
  const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: INTERVAL_MS,
  });

  const rateLimitedGenerateEmbeddings = limiter.wrap(async () => {
    await generateEmbeddings();
    setTimeout(() => rateLimitedGenerateEmbeddings(), INTERVAL_MS);
  });

  rateLimitedGenerateEmbeddings(); // initial call
//   console.log(
//     `🕒 Embedding scheduler initialized (interval: ${INTERVAL_MS}ms)`
//   );
};
