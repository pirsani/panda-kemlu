import { z } from "zod";

export const sbmUangRepresentasiSchema = z.object({
  satuan: z.string().min(3).max(25),
  luarKota: z.number().int(),
  dalamKota: z.number().int(),
  pejabatId: z.number().int(),
  tahun: z.number().int(),
});

export type SbmUangRepresentasi = z.infer<typeof sbmUangRepresentasiSchema>;
