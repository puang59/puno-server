import { z } from "zod";
import { db } from "../../db";
import { todos } from "../../db/schema";
import { eq } from "drizzle-orm";

export default eventHandler(async (event) => {
  const bodySchema = z.object({
    id: z.number(),
  });

  const result = await readBody(event).catch(() => null);

  if (!result) {
    throw new Error("Failed to read body from the event");
  }

  const parsedBodyResult = bodySchema.safeParse(result);

  if (!parsedBodyResult.success) {
    throw new Error("Invalid body format");
  }

  const { id } = parsedBodyResult.data;

  await db.delete(todos).where(eq(todos.id, id));
});
