import { dbHonorarium } from "@/lib/db-honorarium";
import { Provinsi, SbmUhLuarNegeri } from "@prisma-honorarium/client";
import Decimal from "decimal.js";

export type SbmUhLuarNegeriPlainObject = Omit<
  SbmUhLuarNegeri,
  | "golonganA"
  | "golonganB"
  | "golonganC"
  | "golonganD"
  | "createdAt"
  | "updatedAt" // kita omit karena klo decimal dia g bs di passing dari server ke client component
> & {
  golonganA: number | Decimal;
  golonganB: number | Decimal;
  golonganC: number | Decimal;
  golonganD: number | Decimal;
  createdAt: Date | string;
  updatedAt: Date | string;
  negara: {
    id: string;
    nama: string | null;
  };
};

const getReferensiSbmUhLuarNegeri = async () => {
  const sbmUhLuarNegeri = await dbHonorarium.sbmUhLuarNegeri.findMany({
    orderBy: {
      tahun: "asc",
    },
    include: {
      negara: true,
    },
  });
  // Convert Decimal objects to plain numbers
  return sbmUhLuarNegeri;
};

export default getReferensiSbmUhLuarNegeri;
