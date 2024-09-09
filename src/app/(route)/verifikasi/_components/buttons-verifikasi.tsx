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

interface ButtonsVerifikasiProps {
  handleSelection: (jenis: JenisPengajuan) => void;
  kegiatan: Kegiatan | null;
  jenisPengajuan: JenisPengajuan | null;
  className?: string;
}

const ButtonsVerifikasi = ({
  handleSelection,
  kegiatan: initialKegiatan,
  jenisPengajuan,
  className,
}: ButtonsVerifikasiProps) => {
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(initialKegiatan);

  const handleOnClick = (jenis: JenisPengajuan) => {
    handleSelection(jenis);
  };

  useEffect(() => {
    setKegiatan(initialKegiatan);
  }, [initialKegiatan]);

  if (!kegiatan) return null;
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <ButtonRiwayatRampungan
        handleOnClick={() => handleOnClick("GENERATE_RAMPUNGAN")}
        jenisPengajuan={jenisPengajuan}
        statusRampungan={kegiatan.statusRampungan}
      />
      <Button
        variant="outline"
        onClick={() => handleOnClick("HONORARIUM")}
        className={cn(
          "hover:bg-blue-400 hover:text-white",
          jenisPengajuan == "HONORARIUM" && "bg-blue-500 text-white"
        )}
      >
        Verifikasi Honorarium
      </Button>
      {kegiatan.lokasi != LOKASI.LUAR_NEGERI && (
        <ButtonVerifikasiUhDalamNegeri
          handleOnClick={() => handleOnClick("UH_DALAM_NEGERI")}
          jenisPengajuan={jenisPengajuan}
          statusRampungan={kegiatan.statusRampungan}
          statusUhDalamNegeri={kegiatan.statusUhDalamNegeri}
        />
      )}
      {kegiatan.lokasi == LOKASI.LUAR_NEGERI && (
        <ButtonVerifikasiUhLuarNegeri
          handleOnClick={() => handleOnClick("UH_LUAR_NEGERI")}
          jenisPengajuan={jenisPengajuan}
          statusRampungan={kegiatan.statusRampungan}
          statusUhLuarNegeri={kegiatan.statusUhLuarNegeri}
        />
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
        Verifikasi Penggantian/Reinbursement
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
        Verifikasi Pembayaran Pihak Ke-3
      </Button>
    </div>
  );
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
  if (!statusRampungan || statusRampungan === "selesai") return null;

  return (
    <Button
      variant="outline"
      onClick={() => handleOnClick("GENERATE_RAMPUNGAN")}
      className={cn(
        "hover:bg-blue-400 hover:text-white",
        jenisPengajuan == "GENERATE_RAMPUNGAN" && "bg-blue-500 text-white"
      )}
    >
      Verifikasi Generate Rampungan
    </Button>
  );
};

interface ButtonVerifikasiUhDalamNegeriProps {
  handleOnClick: (jenis: JenisPengajuan) => void;
  jenisPengajuan?: JenisPengajuan | null;
  statusRampungan: string | null;
  statusUhDalamNegeri: string | null;
}

const ButtonVerifikasiUhDalamNegeri = ({
  handleOnClick,
  jenisPengajuan,
  statusRampungan,
  statusUhDalamNegeri,
}: ButtonVerifikasiUhDalamNegeriProps) => {
  //jika status rampungan belum ada atau selesai, maka button tidak muncul
  if (
    !statusRampungan ||
    (statusRampungan !== "terverifikasi" && statusRampungan !== "selesai")
  )
    return null;
  //jika status UH dalam negeri bukan pengajuan, maka button tidak muncul
  if (!statusUhDalamNegeri || statusUhDalamNegeri !== "pengajuan") return null;

  return (
    <Button
      variant="outline"
      onClick={() => handleOnClick("UH_DALAM_NEGERI")}
      className={cn(
        "hover:bg-blue-400 hover:text-white",
        jenisPengajuan == "UH_DALAM_NEGERI" && "bg-blue-500 text-white"
      )}
    >
      Verifikasi UH Dalam Negeri
    </Button>
  );
};

interface ButtonVerifikasiUhLuarNegeriProps {
  handleOnClick: (jenis: JenisPengajuan) => void;
  jenisPengajuan?: JenisPengajuan | null;
  statusRampungan: string | null;
  statusUhLuarNegeri: string | null;
}

const ButtonVerifikasiUhLuarNegeri = ({
  handleOnClick,
  jenisPengajuan,
  statusRampungan,
  statusUhLuarNegeri,
}: ButtonVerifikasiUhLuarNegeriProps) => {
  //jika status rampungan belum ada atau selesai, maka button tidak muncul
  if (
    !statusRampungan ||
    (statusRampungan !== "terverifikasi" && statusRampungan !== "selesai")
  )
    return null;
  //jika status UH dalam negeri bukan pengajuan, maka button tidak muncul
  if (!statusUhLuarNegeri || statusUhLuarNegeri !== "pengajuan") return null;

  return (
    <Button
      variant="outline"
      onClick={() => handleOnClick("UH_LUAR_NEGERI")}
      className={cn(
        "hover:bg-blue-400 hover:text-white",
        jenisPengajuan == "UH_LUAR_NEGERI" && "bg-blue-500 text-white"
      )}
    >
      Verifikasi UH Luar Negeri
    </Button>
  );
};

export default ButtonsVerifikasi;
