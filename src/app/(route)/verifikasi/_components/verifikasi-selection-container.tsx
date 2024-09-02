import { Button } from "@/components/ui/button";
import { JenisPengajuan } from "@/types";
import { Kegiatan } from "@prisma-honorarium/client";
import { useState } from "react";
import ButtonsPengajuan from "./buttons-pengajuan";
import HonorariumJadwalContainer from "./honorarium/honorarium-jadwal-container";
import FormGenerateRampungan from "./rampungan/form-generate-rampungan";

interface VerfikasiSelectionContainerProps {
  kegiatan?: Kegiatan | null;
}

const VerfikasiSelectionContainer = ({
  kegiatan,
}: VerfikasiSelectionContainerProps) => {
  const [jenisPengajuan, setJenisPengajuan] = useState<JenisPengajuan | null>();
  const handleSelection = (jenis: JenisPengajuan) => {
    setJenisPengajuan(jenis);
  };
  return (
    kegiatan && (
      <>
        <ButtonsPengajuan
          lokasi={1}
          statusRampungan="belum-ada"
          handleSelection={handleSelection}
        />
        <div className="flex flex-row gap-2 mt-6 w-full border-gray-300 border rounded-md p-2 shadow-lg">
          {jenisPengajuan == "generate-rampungan" && (
            <FormGenerateRampungan kegiatanId={kegiatan.id} />
          )}
          {jenisPengajuan == "honorarium" && (
            <HonorariumJadwalContainer kegiatan={kegiatan} />
          )}
          {jenisPengajuan == "uh-dalam-negeri" && (
            <div>Verifikasi UH Dalam Negeri</div>
          )}
          {jenisPengajuan == "uh-luar-negeri" && (
            <div>Verifikasi UH Luar Negeri</div>
          )}
          {jenisPengajuan == "penggantian-reinbursement" && (
            <div>Verifikasi Penggantian Reinbursement</div>
          )}
          {jenisPengajuan == "pembayaran-pihak-ke-3" && (
            <div>Verifikasi Pembayaran Pihak Ke-3</div>
          )}
        </div>
      </>
    )
  );
};

export default VerfikasiSelectionContainer;
