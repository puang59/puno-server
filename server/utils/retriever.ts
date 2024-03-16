import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { createRetrieverTool } from "langchain/tools/retriever";

export const getRetrieverTool = async ({ userId }: { userId: string }) => {
  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-large",
  });

  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.index("puno");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: userId,
  });

  const retriever = vectorStore.asRetriever();

  const retrieverTool = createRetrieverTool(retriever, {
    name: "jounral_entries_search",
    description:
      "Search for queries in the entires made to the journal. For all questions, you must use this tool!",
  });

  return retrieverTool;
};
