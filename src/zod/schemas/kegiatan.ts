import { isValid, parseISO } from "date-fns";
import { z } from "zod";
import { fileSchema } from "./file-schema";

// Custom validation function to check if the input is a valid date string
const isValidDateString = (value: string) => {
  const parsedDate = parseISO(value);
  return isValid(parsedDate);
};

const tanggalSchema = z
  .string()
  .min(10, {
    message: "Invalid, use format as yyyy-mm-dd.",
  })
  .max(10, {
    message: "Invalid, use format as yyyy-mm-dd.",
  })
  .refine(isValidDateString, {
    message: "Invalid, use format as yyyy-mm-dd.",
  })
  .transform((value) => new Date(value));

export const baseKegiatanSchema = z.object({
  nama: z
    .string()
    .min(10, {
      message: "Nama kegiatan minimal 10 karakter",
    })
    .max(500, {
      message: "Nama kegiatan maksimal 500 karakter",
    }),
  tanggalMulai: tanggalSchema,
  tanggalSelesai: tanggalSchema,
  lokasi: z.coerce.number().min(0).max(2), // Coerce lokasi to number dalam kota, luar kota, luar negeri
  provinsi: z.number(),
  dokumenSurat: fileSchema({ required: true }),
  dokumenJadwal: fileSchema({ required: true }),
  dokumentSuratTugas: z
    .array(fileSchema())
    .nonempty("At least one file is required"), // array of files
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
