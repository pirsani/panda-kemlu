import { z } from "zod";
import { fileSchema } from "./file-schema";
import { golonganRuangSchema } from "./golongan-ruang";
import { tanggalSchema } from "./tanggal";

export const pejabatPerbendaharaanSchema = z.object({
  NIK: z
    .string()
    .min(16, {
      message: "NIK harus 16 digit",
    })
    .max(16)
    .optional(), // id adalah NIK 16 digit jika paspor untuk nonwni maka 16 digit dimulai dari 9 dan 7 digit pertama adalah nomor paspor dan 9 digit terakhir adalah tanggal lahir di format yyyymmdd contoh dipisah dengan strip
  nama: z.string(),
  NIP: z.union([
    z
      .string()
      .length(1, {
        message: "NIP harus 18 digit atau hanya karakter '-' jika tidak ada",
      })
      .regex(/^-$/), // Single character "-"
    z
      .string()
      .length(18)
      .regex(/^\d{18}$/), // 18-character number
  ]),
  jabatanId: z.string(),
  pangkatGolonganId: golonganRuangSchema,
  satkerId: z.string(),
  tmtMulai: tanggalSchema,
  tmtSelesai: tanggalSchema.optional(),
});

export type PejabatPerbendaharaan = z.infer<typeof pejabatPerbendaharaanSchema>;
