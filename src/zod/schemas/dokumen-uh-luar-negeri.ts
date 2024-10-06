import { z } from "zod";
import { fileSchema } from "./file-schema";

export const DokumenUhLuarNegeriSchema = z.object({
  cuid: z.string({ required_error: "CUID harus diisi" }),
  laporanKegiatan: fileSchema({ required: true }),
  laporanKegiatanCuid: z.string({
    required_error: "Dokumen laporan kegiatan harus diupload",
  }),
  daftarHadir: fileSchema({ required: true }),
  daftarHadirCuid: z.string({
    required_error: "Dokumen daftar hadir harus diupload",
  }),
  dokumentasi: fileSchema({ required: true }),
  dokumentasiCuid: z.string({
    required_error: "Dokumen dokumentasi harus diupload",
  }),
  rampungan: fileSchema({ required: true }),
  rampunganCuid: z.string({
    required_error: "Dokumen rampungan harus diupload",
  }),
  suratSetneg: fileSchema({ required: true }),
  suratSetnegCuid: z.string({
    required_error: "Dokumen surat setneg harus diupload",
  }),
  paspor: fileSchema({ required: true }),
  pasporCuid: z.string({ required_error: "Dokumen paspor harus diupload" }),
  tiketBoardingPass: fileSchema({ required: true }),
  tiketBoardingPassCuid: z.string({
    required_error: "Dokumen tiket boarding pass harus diupload",
  }),
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
