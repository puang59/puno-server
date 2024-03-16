import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { z } from "zod";
import { db } from "../../db";
import { notes } from "../../db/schema";

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

  const model = new ChatOpenAI({ modelName: "gpt-4-turbo-preview" });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an excellent distinguisher between two categories of notes: quick notes and todos.
  Todos have a direct tone and imply that a task has to be done. For example: "Finish english assignment".
  Quick notes could be anything from fun facts to events happening around the user. For example: "I learnt that Kung Pao Chicken has peanuts in it" or "I watched Interstellar with Karan today".
  Reply with ONLY "yes" or "no". Reply with "yes" if it's a todo, else reply with "no" if it's a quick note. DO NOT REPLY WITH ANYTHING OTHER THAN "yes" or "no".
  `,
    ],
    ["user", "{input}"],
  ]);

  const outputParser = new StringOutputParser();

  const chain = prompt.pipe(model).pipe(outputParser);

  const todo = await chain.invoke({
    input: content,
  });

  if (todo === "yes") {
    await db
      .insert(notes)
      .values({ userId, content, type: "todo" })
      .returning({ id: notes.id });
  } else if (todo === "no") {
    const noteId = await db
      .insert(notes)
      .values({ userId, content, type: "note" })
      .returning({ id: notes.id });

    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
      chunkSize: 500,
      chunkOverlap: 0,
    });

    const docs = await splitter.createDocuments(
      [content],
      [{ noteId: noteId[0].id }]
    );

    const embeddings = new OpenAIEmbeddings();

    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.index("puno-lol");

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      namespace: userId,
      maxConcurrency: 5,
    });
  } else {
    throw new Error("Invalid response for todo classification");
  }

  return {
    status: 200,
  };
});
