import { z } from "zod";
import { fileSchema } from "./file-schema";

export const DokumenUhDalamNegeriSchema = z.object({
  laporanKegiatan: fileSchema({ required: true }),
  daftarHadir: fileSchema({ required: true }),
  dokumentasi: fileSchema({ required: true }),
  rampungan: fileSchema({ required: true }),
});

// Extend the refined schema for edit mode
export const DokumenUhDalamNegeriSchemaEditMode =
  DokumenUhDalamNegeriSchema.extend({
    laporanKegiatan: fileSchema({ required: false }),
    daftarHadir: fileSchema({ required: false }),
    dokumentasi: fileSchema({ required: false }),
    rampungan: fileSchema({ required: false }),
  });

export type DokumenUhDalamNegeri = z.infer<typeof DokumenUhDalamNegeriSchema>;
export type DokumenUhDalamNegeriEditMode = z.infer<
  typeof DokumenUhDalamNegeriSchemaEditMode
>;
