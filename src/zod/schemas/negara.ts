import { z } from "zod";

const emptyStringToNull = z
  .string()
  .transform((val) => (val === "" || val === "-" ? null : val.toUpperCase()));

const stringToNumberOrNull = z
  .string()
  .transform((val) => (val === "" || val === "-" ? null : Number(val)))
  .nullable();

export const negaraSchema = z.object({
  kodeAlpha2: z.string().min(2).max(2),
  kodeAlpha3: z.string().min(3).max(3),
  kodeNumeric: z.string().min(3).max(3),
  nama: z
    .string()
    .min(2, {
      message: "Nama negara minimal 2 karakter",
    })
    .max(128, {
      message: "Nama negara maksimal 128 karakter",
    }),
  namaInggris: z
    .string()
    .min(2, {
      message: "Nama negara minimal 2 karakter",
    })
    .max(128, {
      message: "Nama negara maksimal 128 karakter",
    }),
  urutan: stringToNumberOrNull,
});

export type Negara = z.infer<typeof negaraSchema>;
