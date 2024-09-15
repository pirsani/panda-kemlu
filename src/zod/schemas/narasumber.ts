import { z } from "zod";
import { fileSchema } from "./file-schema";
import { golonganRuangSchema } from "./golongan-ruang";

export const narasumberSchema = z.object({
  id: z
    .string()
    .min(16, {
      message:
        "NIK harus 16 digit, jika paspor setelah nomor paspor diikuti tanda strip dan angka 0 sampai penuh 16 digit",
    })
    .max(16), // id adalah NIK 16 digit jika paspor untuk nonwni maka 16 digit dimulai dari 9 dan 7 digit pertama adalah nomor paspor dan 9 digit terakhir adalah tanggal lahir di format yyyymmdd contoh dipisah dengan strip
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
  NPWP: z.union([
    z
      .string()
      .length(1, {
        message:
          "NPWP harus 15 atau 16 angka atau hanya karakter '-' jika tidak ada",
      })
      .regex(/^-$/, {
        message:
          "NPWP harus 15 atau 16 angka atau hanya karakter '-' jika tidak ada",
      }), // Single character "-"
    z
      .string()
      .min(15)
      .max(16)
      .regex(/^\d{15,16}$/), // 15 to 16 characters, all digits
  ]),
  jabatan: z.string().optional(),
  eselon: z.string().optional(),
  pangkatGolonganId: golonganRuangSchema,
  email: z.string().email().optional(),
  nomorTelepon: z.string().optional(),
  bank: z.string(),
  namaRekening: z.string(),
  nomorRekening: z.string(),
  dokumenPeryataanRekeningBerbeda: fileSchema({ required: false }),
});

export type Narasumber = z.infer<typeof narasumberSchema>;
