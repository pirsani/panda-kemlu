import { z } from "zod";

export const kegiatanSchema = z.object({
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
  lokasi: z.number().min(0).max(2),
  dokumenSurat: z.string().min(10).max(500),
  dokumenJadwal: z.string().min(10).max(500),
});

export const kegiatanSchemaEditMode = kegiatanSchema.extend({
  dokumenSurat: z.string().optional(),
  dokumenJadwal: z.string().optional(),
});

export type Kegiatan = z.infer<typeof kegiatanSchema>;
export type KegiatanEditMode = z.infer<typeof kegiatanSchemaEditMode>;

export default kegiatanSchema;
