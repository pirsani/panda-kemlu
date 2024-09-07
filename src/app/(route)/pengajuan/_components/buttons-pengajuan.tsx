import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { JenisPengajuan } from "@/types";
import {
  JENIS_PENGAJUAN,
  Kegiatan,
  LOKASI,
  RiwayatProses,
} from "@prisma-honorarium/client";
import { use, useEffect, useState } from "react";
import FormPengajuanGenerateRampungan from "./form-pengajuan-generate-rampungan";
import { DisplayFormPengajuanGenerateRampungan } from "./honorarium/display-form-pengajuan-generate-rampungan";

// generate rampungan, uh dalam negeri, uh luar negeri hanya dapat di ajukan sekali
// honorarium, penggantian reimbursement, pembayaran pihak ke-3 dapat di ajukan berkali-kali
interface MapRiwayatProses {
  [JENIS_PENGAJUAN.HONORARIUM]: RiwayatProses[];
  [JENIS_PENGAJUAN.PENGGANTIAN_REINBURSEMENT]: RiwayatProses[];
  [JENIS_PENGAJUAN.PEMBAYARAN_PIHAK_KETIGA]: RiwayatProses[];
}

interface ButtonsPengajuanProps {
  jenisPengajuan: JenisPengajuan | null;
  kegiatan: Kegiatan | null;
  riwayatProses: RiwayatProses[];
  handleSelection: (jenis: JenisPengajuan) => void;
}

const ButtonsPengajuan = ({
  jenisPengajuan: initialJenisPengajuan,
  kegiatan: initialKegiatan,
  handleSelection,
  riwayatProses,
}: ButtonsPengajuanProps) => {
  const [jenisPengajuan, setJenisPengajuan] = useState<JenisPengajuan | null>(
    initialJenisPengajuan
  );
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(initialKegiatan);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setKegiatan(initialKegiatan);
  }, [initialKegiatan]);

  const [mapRiwayatProses, setMapRiwayatProses] =
    useState<MapRiwayatProses | null>(null);

  const handleOnClick = (jenis: JenisPengajuan) => {
    setJenisPengajuan(jenis);
    handleSelection(jenis);
    console.log("[riwayatProses]", riwayatProses);
  };

  const handleSuccessPengajuanRampungan = (kegiatan: Kegiatan) => {
    // update existing kegiatan
    setKegiatan(kegiatan);
  };

  useEffect(() => {
    console.log("[useEffect][riwayatProses]", riwayatProses);
    setMapRiwayatProses(mappingRiwayatProses(riwayatProses));
  }, [riwayatProses]);

  useEffect(() => {
    console.log("[useEffect][initialJenisPengajuan]", initialJenisPengajuan);
    setJenisPengajuan(initialJenisPengajuan);
  }, [initialJenisPengajuan]);

  if (!kegiatan) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* jika sudah ada generate rampungan, tidak bisa generate rampungan lagi */}
        <ButtonRiwayatRampungan
          statusRampungan={kegiatan.statusRampungan}
          jenisPengajuan={jenisPengajuan}
          handleOnClick={handleOnClick}
        />
        <Button
          variant="outline"
          onClick={() => handleOnClick("HONORARIUM")}
          className={cn(
            "hover:bg-blue-400 hover:text-white",
            jenisPengajuan == "HONORARIUM" && "bg-blue-500 text-white"
          )}
        >
          Ajukan Honorarium
        </Button>
        {kegiatan.lokasi != LOKASI.LUAR_NEGERI && (
          <ButtonAjukanUhDalamNegeri
            statusRampungan={kegiatan.statusRampungan}
            statusUhDalamNegeri={kegiatan.statusUhDalamNegeri}
            jenisPengajuan={jenisPengajuan}
            handleOnClick={handleOnClick}
          />
        )}
        {kegiatan.lokasi == LOKASI.LUAR_NEGERI && (
          <Button
            variant="outline"
            onClick={() => handleOnClick("UH_LUAR_NEGERI")}
            className={cn(
              "hover:bg-blue-400 hover:text-white",
              jenisPengajuan == "UH_LUAR_NEGERI" && "bg-blue-500 text-white"
            )}
          >
            Ajukan UH Luar Negeri
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => handleOnClick("PENGGANTIAN_REINBURSEMENT")}
          className={cn(
            "hover:bg-blue-400 hover:text-white",
            jenisPengajuan == "PENGGANTIAN_REINBURSEMENT" &&
              "bg-blue-500 text-white"
          )}
        >
          Ajukan Penggantian/Reinbursement
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOnClick("PEMBAYARAN_PIHAK_KETIGA")}
          className={cn(
            "hover:bg-blue-400 hover:text-white",
            jenisPengajuan == "PEMBAYARAN_PIHAK_KETIGA" &&
              "bg-blue-500 text-white"
          )}
        >
          Ajukan Pembayaran Pihak Ke-3
        </Button>
      </div>
    </>
  );
};

const mappingRiwayatProses = (riwayatProses: RiwayatProses[]) => {
  const mapped: MapRiwayatProses = {
    [JENIS_PENGAJUAN.HONORARIUM]: [],
    [JENIS_PENGAJUAN.PENGGANTIAN_REINBURSEMENT]: [],
    [JENIS_PENGAJUAN.PEMBAYARAN_PIHAK_KETIGA]: [],
  };

  riwayatProses.forEach((proses) => {
    const jenis = proses.jenis;
  });
  console.log("[mapped]", mapped);
  return mapped;
};

interface ButtonRiwayatRampunganProps {
  handleOnClick: (jenis: JenisPengajuan) => void;
  jenisPengajuan?: JenisPengajuan | null;
  statusRampungan: string | null;
}
const ButtonRiwayatRampungan = ({
  handleOnClick,
  jenisPengajuan,
  statusRampungan,
}: ButtonRiwayatRampunganProps) => {
  if (statusRampungan && statusRampungan === "terverifikasi") return null;

  return (
    <Button
      variant="outline"
      onClick={() => handleOnClick("GENERATE_RAMPUNGAN")}
      className={cn(
        "hover:bg-blue-400 hover:text-white",
        jenisPengajuan == "GENERATE_RAMPUNGAN" && "bg-blue-500 text-white"
      )}
    >
      Ajukan Generate Rampungan
    </Button>
  );
};

interface ButtonAjukanUhDalamNegeriProps {
  handleOnClick: (jenis: JenisPengajuan) => void;
  jenisPengajuan?: JenisPengajuan | null;
  statusRampungan: string | null;
  statusUhDalamNegeri: string | null;
}

const ButtonAjukanUhDalamNegeri = ({
  handleOnClick,
  jenisPengajuan,
  statusRampungan,
  statusUhDalamNegeri,
}: ButtonAjukanUhDalamNegeriProps) => {
  if (!statusRampungan || statusRampungan !== "terverifikasi") return null;
  return (
    <Button
      variant="outline"
      onClick={() => handleOnClick("UH_DALAM_NEGERI")}
      className={cn(
        "hover:bg-blue-400 hover:text-white",
        jenisPengajuan == "UH_DALAM_NEGERI" && "bg-blue-500 text-white"
      )}
    >
      Ajukan UH Dalam Negeri
    </Button>
  );
};

export default ButtonsPengajuan;
