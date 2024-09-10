import { fileSchema } from "@/zod/schemas/file-schema";
import { z } from "zod";

export const excelReferensiTemplateSchema = z.object({
  file: fileSchema({ required: true }),
});

export type ExcelReferensiTemplate = z.infer<
  typeof excelReferensiTemplateSchema
>;
