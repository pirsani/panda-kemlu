import { isValid, parseISO } from "date-fns";
import { z } from "zod";

// Custom validation function to check if the input is a valid date string
const isValidDateString = (value: string): boolean => {
  const parsedDate = parseISO(value);
  return isValid(parsedDate);
};

interface TanggalSchemaOptions {
  message?: string;
  field?: string;
}

const tanggalSchema = ({
  message = "",
  field = "Tanggal",
}: TanggalSchemaOptions) => {
  const tanggalSchema = z
    .string({ message: `${field} harus diisi` })
    .min(10, {
      message: `format ${field} harus yyyy-mm-dd`,
    })
    .max(10, {
      message: `format ${field} harus yyyy-mm-dd`,
    })
    .refine(isValidDateString, {
      message: `format  ${field} harus yyyy-mm-dd`,
    })
    .transform((value) => new Date(value));
  return tanggalSchema;
};

export const baseItinerarySchema = z.object({
  tanggalMulai: tanggalSchema({ field: "Tanggal Mulai" }),
  tanggalSelesai: tanggalSchema({ field: "Tanggal Selesai" }),
  dariLokasiId: z.string(),
  dariLokasi: z.string().optional().nullable(),
  keLokasiId: z.string(),
  keLokasi: z.string().optional().nullable(),
});

export const itinerarySchema = baseItinerarySchema.refine(
  (data) => data.tanggalMulai <= data.tanggalSelesai,
  {
    message: "Tanggal Mulai harus kurang dari atau sama dengan Tanggal Selesai",
    path: ["tanggalMulai"], // This will point the error to the tanggalMulai field
  }
);

export type Itinerary = z.infer<typeof itinerarySchema>;
