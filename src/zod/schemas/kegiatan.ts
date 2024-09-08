import { isValid, parseISO } from "date-fns";
import { z } from "zod";
import { fileSchema } from "./file-schema";

// Define the enum values as a Zod enum
const LokasiEnum = z.enum(["DALAM_KOTA", "LUAR_KOTA", "LUAR_NEGERI"]);

// Custom validation function to check if the input is a valid date string
const isValidDateString = (value: string) => {
  const parsedDate = parseISO(value);
  return isValid(parsedDate);
};

const tanggalSchema = z
  .string()
  .min(10, {
    message: "please complete the date",
  })
  .max(10, {
    message: "please use valid date format",
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
  lokasi: LokasiEnum, // Use the Zod enum schema for lokasi
  provinsi: z.number(),
  dokumenNodinMemoSk: fileSchema({ required: true }),
  dokumenJadwal: fileSchema({ required: true }),
  dokumenSuratTugas: z.union([
    fileSchema({ required: true }),
    z
      .array(fileSchema({ required: true }))
      .nonempty({ message: "Surat Tugas harus diisi" }),
  ]),
  pesertaXlsx: fileSchema({
    required: true,
    allowedTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  }),
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
    dokumenNodinMemoSk: fileSchema({ required: false }),
    dokumenJadwal: fileSchema({ required: false }),
  })
  .refine((data) => data.tanggalMulai <= data.tanggalSelesai, {
    message: "Tanggal Mulai harus kurang dari atau sama dengan Tanggal Selesai",
    path: ["tanggalMulai"], // This will point the error to the tanggalMulai field
  });

export type Kegiatan = z.infer<typeof kegiatanSchema>;
export type KegiatanEditMode = z.infer<typeof kegiatanSchemaEditMode>;

export default kegiatanSchema;
