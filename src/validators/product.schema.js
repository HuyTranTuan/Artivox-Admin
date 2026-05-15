import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["MODEL", "MATERIAL", "TOOL"]),
  thumbnail: z.string(),
  description: z.string(),
  collection: z?.string(),
  discountCampain: z?.string(),
  stock: z.number().minValue(10000),
  basePrice: z.number().minValue(10000),
  images: z.string(),
});
