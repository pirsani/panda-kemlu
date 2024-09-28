import { z } from "zod";

export const roleSchema = z.object({
  id: z.string().cuid().optional(),
  name: z
    .string()
    .min(6, {
      message: "Nama Role minimal 5 karakter",
    })
    .max(128, {
      message: "Nama Role maksimal 255 karakter",
    }),
});

export type Role = z.infer<typeof roleSchema>;
