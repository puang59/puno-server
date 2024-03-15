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
});
