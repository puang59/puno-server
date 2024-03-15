import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { z } from "zod";

export default eventHandler(async (event) => {
  const bodySchema = z.object({
    content: z.string().min(1),
    userId: z.string().min(1),
  });

  const result = await readBody(event).catch(() => null);

  if (!result) {
    throw new Error("Failed to read body from the event");
  }

  const parsedBodyResult = bodySchema.safeParse(result);

  if (!parsedBodyResult.success) {
    throw new Error("Invalid body format");
  }

  const { content, userId } = parsedBodyResult.data;

  const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    chunkSize: 500,
    chunkOverlap: 0,
  });

  const docs = await splitter.createDocuments([content]);
  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-large",
  });

  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.index("puno");

  await PineconeStore.fromDocuments(docs, embeddings, {
    pineconeIndex,
    namespace: userId,
    maxConcurrency: 5,
  });

  return {
    status: 200,
  };
});
