import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import { dbHonorarium } from "@/lib/db-honorarium";
import { Provinsi, SbmUhDalamNegeri } from "@prisma-honorarium/client";
import Decimal from "decimal.js";

export type SbmUhDalamNegeriPlainObject = Omit<
  SbmUhDalamNegeri,
  | "fullboard"
  | "fulldayHalfday"
  | "luarKota"
  | "dalamKota"
  | "diklat"
  | "createdAt"
  | "updatedAt" // kita omit karena klo decimal dia g bs di passing dari server ke client component
> & {
  fullboard: Decimal | number;
  fulldayHalfday: Decimal | number;
  luarKota: Decimal | number;
  dalamKota: Decimal | number;
  diklat: Decimal | number;
  createdAt: Date | string;
  updatedAt: Date | string;
  provinsi: Provinsi;
};

const getReferensiSbmUhDalamNegeri = async () => {
  const tahunAnggaran = await getTahunAnggranPilihan();

  const sbmUhDalamNegeri = await dbHonorarium.sbmUhDalamNegeri.findMany({
    where: {
      tahun: tahunAnggaran,
    },
    orderBy: {
      tahun: "asc",
    },
    include: {
      provinsi: true,
    },
  });
  // Convert Decimal objects to plain numbers
  return sbmUhDalamNegeri;
};

export default getReferensiSbmUhDalamNegeri;
