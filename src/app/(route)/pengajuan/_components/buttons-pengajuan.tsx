import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { JenisPengajuan } from "@/types";
import {
  JENIS_PENGAJUAN,
  Kegiatan,
  LOKASI,
  RiwayatProses,
} from "@prisma-honorarium/client";
import { useEffect, useState } from "react";
import FormPengajuanGenerateRampungan from "./form-pengajuan-generate-rampungan";

// generate rampungan, uh dalam negeri, uh luar negeri hanya dapat di ajukan sekali
// honorarium, penggantian reimbursement, pembayaran pihak ke-3 dapat di ajukan berkali-kali
interface MapRiwayatProses {
  [JENIS_PENGAJUAN.GENERATE_RAMPUNGAN]: RiwayatProses | null;
  [JENIS_PENGAJUAN.HONORARIUM]: RiwayatProses[];
  [JENIS_PENGAJUAN.UH_DALAM_NEGERI]: RiwayatProses | null;
  [JENIS_PENGAJUAN.UH_LUAR_NEGERI]: RiwayatProses | null;
  [JENIS_PENGAJUAN.PENGGANTIAN_REINBURSEMENT]: RiwayatProses[];
  [JENIS_PENGAJUAN.PEMBAYARAN_PIHAK_KETIGA]: RiwayatProses[];
}

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

  const [mapRiwayatProses, setMapRiwayatProses] =
    useState<MapRiwayatProses | null>(null);

  const handleOnClick = (jenis: JenisPengajuan) => {
    setJenisPengajuan(jenis);
    handleSelection(jenis);
    console.log("[riwayatProses]", riwayatProses);
  };

  const handleSuccessPengajuanRampungan = (riwayat: RiwayatProses) => {
    setMapRiwayatProses((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [JENIS_PENGAJUAN.GENERATE_RAMPUNGAN]: riwayat,
      };
    });
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setJenisPengajuan(null);
  }, [kegiatan]);

  useEffect(() => {
    console.log("[useEffect][riwayatProses]", riwayatProses);
    setMapRiwayatProses(mappingRiwayatProses(riwayatProses));
  }, [riwayatProses]);

  if (!kegiatan) return null;

  if (!mapRiwayatProses) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* jika sudah ada generate rampungan, tidak bisa generate rampungan lagi */}
        <ButtonRiwayatRampungan
          existingRampungan={
            mapRiwayatProses[JENIS_PENGAJUAN.GENERATE_RAMPUNGAN]
          }
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
            existingRampungan={
              mapRiwayatProses[JENIS_PENGAJUAN.GENERATE_RAMPUNGAN]
            }
            existingPengajuan={
              mapRiwayatProses[JENIS_PENGAJUAN.UH_DALAM_NEGERI]
            }
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

      <DisplayFormPengajuanGenerateRampungan
        jenisPengajuan={jenisPengajuan}
        existingRampungan={mapRiwayatProses[JENIS_PENGAJUAN.GENERATE_RAMPUNGAN]}
        kegiatan={kegiatan}
        handleSuccess={handleSuccessPengajuanRampungan}
      />
    </>
  );
};

const mappingRiwayatProses = (riwayatProses: RiwayatProses[]) => {
  const mapped: MapRiwayatProses = {
    [JENIS_PENGAJUAN.GENERATE_RAMPUNGAN]: null,
    [JENIS_PENGAJUAN.HONORARIUM]: [],
    [JENIS_PENGAJUAN.UH_DALAM_NEGERI]: null,
    [JENIS_PENGAJUAN.UH_LUAR_NEGERI]: null,
    [JENIS_PENGAJUAN.PENGGANTIAN_REINBURSEMENT]: [],
    [JENIS_PENGAJUAN.PEMBAYARAN_PIHAK_KETIGA]: [],
  };

  riwayatProses.forEach((proses) => {
    const jenis = proses.jenis;

    // Handle single object types
    if (
      jenis === JENIS_PENGAJUAN.GENERATE_RAMPUNGAN ||
      jenis === JENIS_PENGAJUAN.UH_DALAM_NEGERI ||
      jenis === JENIS_PENGAJUAN.UH_LUAR_NEGERI
    ) {
      mapped[jenis] = proses; // Directly assign the object
    } else if (
      // Handle array types
      jenis === JENIS_PENGAJUAN.HONORARIUM ||
      jenis === JENIS_PENGAJUAN.PENGGANTIAN_REINBURSEMENT ||
      jenis === JENIS_PENGAJUAN.PEMBAYARAN_PIHAK_KETIGA
    ) {
      (mapped[jenis] as RiwayatProses[]).push(proses); // Push to the array
    }
  });
  console.log("[mapped]", mapped);
  return mapped;
};

interface ButtonRiwayatRampunganProps {
  handleOnClick: (jenis: JenisPengajuan) => void;
  jenisPengajuan?: JenisPengajuan | null;
  existingRampungan: RiwayatProses | null;
}
const ButtonRiwayatRampungan = ({
  handleOnClick,
  jenisPengajuan,
  existingRampungan,
}: ButtonRiwayatRampunganProps) => {
  if (existingRampungan && existingRampungan.status == "terverifikasi")
    return null;
  if (!existingRampungan || existingRampungan.status === "pengajuan")
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

interface DisplayFormPengajuanGenerateRampunganProps {
  jenisPengajuan?: JenisPengajuan | null;
  existingRampungan: RiwayatProses | null;
  kegiatan: Kegiatan;
  handleSuccess: (riwayat: RiwayatProses) => void; // harusnya update ke atas
}
const DisplayFormPengajuanGenerateRampungan = ({
  jenisPengajuan,
  existingRampungan,
  kegiatan,
  handleSuccess,
}: DisplayFormPengajuanGenerateRampunganProps) => {
  const [currentRampungan, setCurrentRampungan] =
    useState<RiwayatProses | null>(existingRampungan);

  // Success handler to update the state and call the parent success handler
  // disini harusnya update ke atas
  // const handleSuccess = (riwayat: RiwayatProses) => {
  //   setCurrentRampungan(riwayat);
  // };

  useEffect(() => {
    setCurrentRampungan(existingRampungan);
  }, [existingRampungan]);

  console.log("[jenisPengajuan]", currentRampungan);
  console.log("[currentRampungan]", currentRampungan);
  console.log("[existingRampungan]", existingRampungan);

  // Render the form if GENERATE_RAMPUNGAN is selected and there's no existing rampungan
  if (jenisPengajuan === "GENERATE_RAMPUNGAN" && !existingRampungan) {
    return (
      <FormPengajuanGenerateRampungan
        kegiatanId={kegiatan.id}
        handleSuccess={handleSuccess}
      />
    );
  }

  // Render the status message if GENERATE_RAMPUNGAN is selected, rampungan exists, and is not verified
  const shouldShowStatusMessage =
    jenisPengajuan === "GENERATE_RAMPUNGAN" &&
    existingRampungan &&
    existingRampungan.status !== "terverifikasi";

  if (shouldShowStatusMessage) {
    const updatedAt = existingRampungan.updatedAt;
    const createdAt = existingRampungan.createdAt;

    return (
      <p className="text-red-500 ring-1 rounded-md p-2 mt-2 bg-green-200">
        <span>
          Pengajuan Generate Rampungan{" "}
          {existingRampungan.kegiatanId + " " + existingRampungan.jenis}{" "}
          berhasil diajukan pada tanggal{" "}
          {(updatedAt ?? createdAt).toLocaleDateString()}{" "}
          {(updatedAt ?? createdAt).toLocaleTimeString()}
          {","}
        </span>
        <span> status: {existingRampungan.status}</span>
      </p>
    );
  }

  // Default return, you can add any fallback UI if needed
  return null;
};

interface ButtonAjukanUhDalamNegeriProps {
  handleOnClick: (jenis: JenisPengajuan) => void;
  jenisPengajuan?: JenisPengajuan | null;
  existingRampungan: RiwayatProses | null;
  existingPengajuan: RiwayatProses | null;
}

const ButtonAjukanUhDalamNegeri = ({
  handleOnClick,
  jenisPengajuan,
  existingRampungan,
  existingPengajuan,
}: ButtonAjukanUhDalamNegeriProps) => {
  if (!existingRampungan || existingRampungan.status != "terverifikasi")
    return null;
  if (!existingPengajuan || existingPengajuan.status === "pengajuan")
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
