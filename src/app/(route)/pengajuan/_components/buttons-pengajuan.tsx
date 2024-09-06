import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { JenisPengajuan } from "@/types";
import { Kegiatan, LOKASI, RiwayatProses } from "@prisma-honorarium/client";
import { useEffect, useState } from "react";

interface ButtonsPengajuanProps {
  kegiatan: Kegiatan | null;
  riwayatProses: RiwayatProses[];
  handleSelection: (jenis: JenisPengajuan) => void;
}

const ButtonsPengajuan = ({
  kegiatan,
  handleSelection,
  riwayatProses,
}: ButtonsPengajuanProps) => {
  const [jenisPengajuan, setJenisPengajuan] = useState<JenisPengajuan | null>();
  const [existingRampungan, setExistingRampungan] =
    useState<RiwayatProses | null>(null);

  const handleOnClick = (jenis: JenisPengajuan) => {
    setJenisPengajuan(jenis);
    handleSelection(jenis);
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    console.log("kegiatan", kegiatan);
  }, [kegiatan]);

  useEffect(() => {
    console.log("riwayatProses", riwayatProses);
    const prosesRampungan = riwayatProses.find(
      (r) => r.jenis === "GENERATE_RAMPUNGAN"
    );
    if (prosesRampungan) {
      console.log("prosesRampungan", prosesRampungan);
      setExistingRampungan(prosesRampungan);
    }
  }, [riwayatProses]);

  if (!kegiatan) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {/* jika sudah ada generate rampungan, tidak bisa generate rampungan lagi */}
      <ButtonRiwayatRampungan
        existingRampungan={existingRampungan}
        jenisPengajuan="GENERATE_RAMPUNGAN"
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
  );
};

interface ButtonRiwayatRampunganProps {
  handleOnClick: (jenis: JenisPengajuan) => void;
  jenisPengajuan: JenisPengajuan;
  existingRampungan: RiwayatProses | null;
}
const ButtonRiwayatRampungan = ({
  handleOnClick,
  jenisPengajuan,
  existingRampungan,
}: ButtonRiwayatRampunganProps) => {
  if (existingRampungan && existingRampungan.status == "terverifikasi")
    return null;
  if (!existingRampungan || existingRampungan.status !== "terverifikasi")
    return (
      <Button
        variant="outline"
        onClick={() => handleOnClick("GENERATE_RAMPUNGAN")}
        className={cn(
          "hover:bg-blue-400 hover:text-white",
          jenisPengajuan == "GENERATE_RAMPUNGAN" && "bg-blue-500 text-white"
        )}
      >
        Ajukan Generate Rampungan {existingRampungan?.status}
      </Button>
    );
};

export default ButtonsPengajuan;
