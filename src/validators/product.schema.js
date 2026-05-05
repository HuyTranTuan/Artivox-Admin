import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["MODEL", "MATERIAL", "TOOL"])
});
