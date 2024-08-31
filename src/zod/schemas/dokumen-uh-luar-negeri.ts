import { z } from "zod";
import { fileSchema } from "./file-schema";

export const DokumenUhLuarNegeriSchema = z.object({
  laporanKegiatan: fileSchema({ required: true }),
  daftarHadir: fileSchema({ required: true }),
  dokumentasi: fileSchema({ required: true }),
  rampungan: fileSchema({ required: true }),
  suratSetneg: fileSchema({ required: true }),
  paspor: fileSchema({ required: true }),
  tiketBoardingPass: fileSchema({ required: true }),
});

// Extend the refined schema for edit mode
export const DokumenUhLuarNegeriSchemaEditMode =
  DokumenUhLuarNegeriSchema.extend({
    laporanKegiatan: fileSchema({ required: false }),
    daftarHadir: fileSchema({ required: false }),
    dokumentasi: fileSchema({ required: false }),
    rampungan: fileSchema({ required: false }),
    suratSetneg: fileSchema({ required: false }),
    paspor: fileSchema({ required: false }),
    tiketBoardingPass: fileSchema({ required: false }),
  });

export type DokumenUhLuarNegeri = z.infer<typeof DokumenUhLuarNegeriSchema>;
export type DokumenUhLuarNegeriEditMode = z.infer<
  typeof DokumenUhLuarNegeriSchemaEditMode
>;
