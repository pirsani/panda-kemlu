"use client";
import { Button } from "@/components/ui/button";
import { Kegiatan } from "@/lib/alur-proses";
import { JenisPengajuan } from "@/types";
import { useState } from "react";
import ButtonsPengajuan from "./buttons-pengajuan";
import HonorariumContainer from "./honorarium/honorarium-container";
import PenggantianContainer from "./penggantian-container";
import PihakKe3Container from "./pihak-ke3-container";
import UhDalamNegeriContainer from "./uh-dalam-negeri-container";
import UhLuarNegeriContainer from "./uh-luar-negeri-container";
import UpdateFlow from "./update-flow";

const PengajuanContainer = () => {
  const kegiatan: Kegiatan = {
    id: 1,
    langkahSekarang: "setup",
    langkahSelanjutnya: "pengajuan",
    status: "Draft",
  };

  const [jenisPengajuan, setJenisPengajuan] = useState<JenisPengajuan | null>();
  const handleSelection = (jenis: JenisPengajuan) => {
    setJenisPengajuan(jenis);
  };

  return (
    <div>
      <ButtonsPengajuan
        handleSelection={handleSelection}
        lokasi={1}
        statusRampungan="sudah-ada"
      />
      {jenisPengajuan == "honorarium" && <HonorariumContainer />}
      {jenisPengajuan == "uh-dalam-negeri" && <UhDalamNegeriContainer />}
      {jenisPengajuan == "uh-luar-negeri" && <UhLuarNegeriContainer />}
      {jenisPengajuan == "penggantian-reinbursement" && (
        <PenggantianContainer />
      )}
      {jenisPengajuan == "pembayaran-pihak-ke-3" && <PihakKe3Container />}

      <UpdateFlow initKegiatan={kegiatan} />
    </div>
  );
};

export default PengajuanContainer;
