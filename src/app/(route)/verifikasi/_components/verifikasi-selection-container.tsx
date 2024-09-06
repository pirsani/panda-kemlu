import DaftarJadwal from "@/components/kegiatan/honorarium/daftar-jadwal";
import { JenisPengajuan } from "@/types";
import { Kegiatan } from "@prisma-honorarium/client";
import { useState } from "react";
import ButtonsPengajuan from "./buttons-pengajuan";
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
        <div className="flex flex-col gap-2 mt-6 w-full border-gray-300 border rounded-md p-2 shadow-lg">
          {jenisPengajuan == "GENERATE_RAMPUNGAN" && (
            <FormGenerateRampungan kegiatanId={kegiatan.id} />
          )}
          {jenisPengajuan == "HONORARIUM" && (
            <DaftarJadwal kegiatanId={kegiatan.id} proses="verfikasi" />
          )}
          {jenisPengajuan == "UH_DALAM_NEGERI" && (
            <div>Verifikasi UH Dalam Negeri</div>
          )}
          {jenisPengajuan == "UH_LUAR_NEGERI" && (
            <div>Verifikasi UH Luar Negeri</div>
          )}
          {jenisPengajuan == "PENGGANTIAN_REINBURSEMENT" && (
            <div>Verifikasi Penggantian Reinbursement</div>
          )}
          {jenisPengajuan == "PEMBAYARAN_PIHAK_KETIGA" && (
            <div>Verifikasi Pembayaran Pihak Ke-3</div>
          )}
        </div>
      </>
    )
  );
};

export default VerfikasiSelectionContainer;
