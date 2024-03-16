import { z } from "zod";
import { db } from "../../db";
import { todos } from "../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const bodySchema = z.object({
    userId: z.string(),
  });

  const result = getQuery(event);

  if (!result) {
    throw new Error("fail lol");
  }

  console.log(result.userId);

  const parsedBodyResult = bodySchema.safeParse(result);

  if (!parsedBodyResult.success) {
    throw new Error("Invalid body format");
  }

  const { userId } = parsedBodyResult.data;

  return await db.select().from(todos).where(eq(todos.userId, userId));
});
