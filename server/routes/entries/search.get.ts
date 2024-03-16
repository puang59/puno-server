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

  return {
    status: 200,
  };
});
