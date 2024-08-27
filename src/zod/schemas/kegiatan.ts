import { z } from "zod";
import { fileSchema } from "./file-schema";

export const baseKegiatanSchema = z.object({
  nama: z
    .string()
    .min(10, {
      message: "Nama kegiatan minimal 10 karakter",
    })
    .max(500, {
      message: "Nama kegiatan maksimal 500 karakter",
    }),
  tanggalMulai: z.coerce.date(),
  tanggalSelesai: z.coerce.date(),
  lokasi: z.coerce.number().min(0).max(2), // Coerce lokasi to number
  dokumenSurat: fileSchema({ required: true }),
  dokumenJadwal: fileSchema({ required: true }),
});

// Apply the refine method to add custom validation
export const kegiatanSchema = baseKegiatanSchema.refine(
  (data) => data.tanggalMulai <= data.tanggalSelesai,
  {
    message: "Tanggal Mulai harus kurang dari atau sama dengan Tanggal Selesai",
    path: ["tanggalMulai"], // This will point the error to the tanggalMulai field
  }
);

// Extend the refined schema for edit mode
export const kegiatanSchemaEditMode = baseKegiatanSchema
  .extend({
    dokumenSurat: fileSchema({ required: false }),
    dokumenJadwal: fileSchema({ required: false }),
  })
  .refine((data) => data.tanggalMulai <= data.tanggalSelesai, {
    message: "Tanggal Mulai harus kurang dari atau sama dengan Tanggal Selesai",
    path: ["tanggalMulai"], // This will point the error to the tanggalMulai field
  });

export type Kegiatan = z.infer<typeof kegiatanSchema>;
export type KegiatanEditMode = z.infer<typeof kegiatanSchemaEditMode>;

export default kegiatanSchema;
