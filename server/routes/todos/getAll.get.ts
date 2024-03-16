import { z } from "zod";
import { db } from "../../db";
import { todos } from "../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const bodySchema = z.object({
    id: z.number(),
  });

  const result = getQuery(event);

  if (!result) {
    throw new Error("fail lol");
  }

  const parsedBodyResult = bodySchema.safeParse(result);

  if (!parsedBodyResult.success) {
    throw new Error("Invalid body format");
  }

  const { id } = parsedBodyResult.data;

  return await db.select().from(todos).where(eq(todos.id, id));
});
