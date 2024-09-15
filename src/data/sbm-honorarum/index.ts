import { dbHonorarium } from "@/lib/db-honorarium";
import { SbmHonorarium } from "@prisma-honorarium/client";
import Decimal from "decimal.js";

export type SbmHonorariumWithNumber = Omit<
  SbmHonorarium,
  "besaran" // kita omit karena klo decimal dia g bs di passing dari server ke client component
> & {
  besaran: Decimal | number;
};

const getReferensiSbmHonorarium = async () => {
  const sbmHonorarium = await dbHonorarium.sbmHonorarium.findMany({
    orderBy: {
      tahun: "asc",
    },
  });
  // Convert Decimal objects to plain numbers
  return sbmHonorarium;
};

export default getReferensiSbmHonorarium;
