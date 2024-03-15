import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const bodySchema = z.object({
    query: z.string().min(1),
    userId: z.string().min(1),
  });

  const result = getQuery(event);

  if (!result) {
    throw new Error("fail lol");
  }

  const parsedBodyResult = bodySchema.safeParse(result);

  if (!parsedBodyResult.success) {
    throw new Error("Invalid body format");
  }

  const { query, userId } = parsedBodyResult.data;

  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-large",
  });

  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.index("puno");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: userId,
  });

  const results = await vectorStore.similaritySearch(query, 1);

  return {
    results,
  };
});
