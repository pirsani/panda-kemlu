import { z } from "zod";
import { fileSchema } from "./file-schema";
import {
  golonganRuangSchema,
  pangkatGolonganOptionalNullableSchema,
} from "./golongan-ruang";

const emptyStringToNull = z
  .string()
  .transform((val) => (val === "" ? null : val));

export const narasumberSchema = z.object({
  id: z
    .string()
    .min(16, {
      message:
        "NIK harus 16 digit, jika paspor setelah nomor paspor diikuti tanda strip dan angka 0 sampai penuh 16 digit",
    })
    .max(16), // id adalah NIK 16 digit jika paspor untuk nonwni maka 16 digit dimulai dari 9 dan 7 digit pertama adalah nomor paspor dan 9 digit terakhir adalah tanggal lahir di format yyyymmdd contoh dipisah dengan strip
  nama: z.string().min(3).max(150),
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
  jabatan: z.string().length(1, {
    message: "isi dengan '-' jika tidak ada jabatan",
  }),
  eselon: z.string().length(1, {
    message: "isi dengan '-' jika bukan pejabat eselon",
  }),
  pangkatGolonganId: pangkatGolonganOptionalNullableSchema,
  email: emptyStringToNull
    .nullable()
    .optional()
    .refine(
      (val) =>
        val === null ||
        val === undefined ||
        z.string().email().safeParse(val).success,
      {
        message: "Invalid email address",
      }
    ),
  nomorTelepon: emptyStringToNull.nullable().optional(),
  bank: emptyStringToNull.nullable().optional(),
  namaRekening: emptyStringToNull.nullable().optional(),
  nomorRekening: emptyStringToNull.nullable().optional(),
  dokumenPeryataanRekeningBerbeda: fileSchema({ required: false }),
});

export type Narasumber = z.infer<typeof narasumberSchema>;
