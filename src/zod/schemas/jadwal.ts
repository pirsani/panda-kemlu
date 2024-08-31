import { date, z } from "zod";
import { fileSchema } from "./file-schema";

export const jadwalSchema = z.object({
  materiId: z.string().min(3).max(25),
  kelasId: z.string().min(3).max(25),
  tanggal: z.coerce.date(),
  dokumenDaftarHadir: fileSchema({ required: true }),
  dokumenSurat: fileSchema({ required: true }),
});

export type Jadwal = z.infer<typeof jadwalSchema>;
