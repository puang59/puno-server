import { createRetrievalChain } from "langchain/chains/retrieval";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
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

  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.index("puno-lol");

  const embeddings = new OpenAIEmbeddings();

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: userId,
  });

  const model = new ChatOpenAI({
    modelName: "gpt-4-turbo-preview",
  });

  const prompt =
    ChatPromptTemplate.fromTemplate(`Imagine you are a search engine that gives it's output in natural language. You answer questions concisely and are direct to the point. While answering the quesiton, refer to the user or the speaker directly by using words like "you" or "your". Do NOT refer to the user or the speaker in third person. Answer the following question based only on the provided context:
  <context>
  {context}
  </context>

  Question: {input}`);

  const documentChain = await createStuffDocumentsChain({ llm: model, prompt });

  const retriever = vectorStore.asRetriever();

  const retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever,
  });

  const res = await retrievalChain.invoke({ input: query });

  return {
    status: 200,
    answer: res.answer,
  };
});
