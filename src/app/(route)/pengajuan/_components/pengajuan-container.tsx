"use client";
import { getKegiatanById } from "@/actions/kegiatan";
import FloatingComponent from "@/components/floating-component";
import PreviewKegiatan from "@/components/kegiatan";
import DaftarJadwal from "@/components/kegiatan/honorarium/daftar-jadwal";
import PdfPreviewContainer from "@/components/pdf-preview-container";
import { Button } from "@/components/ui/button";
import { JenisPengajuan } from "@/types";
import { Kegiatan } from "@prisma-honorarium/client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import ButtonsPengajuan from "./buttons-pengajuan";
import HonorariumContainer from "./honorarium/honorarium-container";
import PenggantianContainer from "./penggantian-container";
import PihakKe3Container from "./pihak-ke3-container";
import UhDalamNegeriContainer from "./uh-dalam-negeri-container";
import UhLuarNegeriContainer from "./uh-luar-negeri-container";

const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

const PengajuanContainer = () => {
  const [kegiatanId, setKegiatanId] = useState<number | null>(null);
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);

  const handleKegiatanChange = (value: number | null) => {
    console.log(value);
    setKegiatanId(value); // after this set, it will trigger re-render PreviewKegiatan
  };

  const [jenisPengajuan, setJenisPengajuan] = useState<JenisPengajuan | null>();
  const handleSelection = (jenis: JenisPengajuan) => {
    setJenisPengajuan(jenis);
  };

  useEffect(() => {
    console.log("kegiatanId", kegiatanId);
    const getKegiatan = async () => {
      if (kegiatanId) {
        const data = await getKegiatanById(kegiatanId);
        setKegiatan(data);
      }
    };
    getKegiatan();
  }, [kegiatanId]);

  return (
    <div className="relative flex flex-col w-full gap-6 pb-20">
      <div className="w-1/2 flex flex-col gap-2 ">
        <SelectKegiatan inputId="kegiatan" onChange={handleKegiatanChange} />
        <div className="flex flex-row gap-2 w-full border-gray-300 border rounded-md p-2 shadow-lg">
          <PreviewKegiatan kegiatan={kegiatan} className="w-full" />
        </div>
      </div>
      <div className="w-1/2 flex flex-col gap-2 ">
        <ButtonsPengajuan
          handleSelection={handleSelection}
          lokasi={2}
          statusRampungan="sudah-ada"
        />
        {jenisPengajuan == "honorarium" && kegiatan && (
          <HonorariumContainer kegiatan={kegiatan} />
        )}
        {jenisPengajuan == "uh-dalam-negeri" && <UhDalamNegeriContainer />}
        {jenisPengajuan == "uh-luar-negeri" && <UhLuarNegeriContainer />}
        {jenisPengajuan == "penggantian-reinbursement" && (
          <PenggantianContainer />
        )}
        {jenisPengajuan == "pembayaran-pihak-ke-3" && <PihakKe3Container />}
      </div>

      <FloatingComponent>
        <PdfPreviewContainer className="border-2 h-full border-gray-500" />
      </FloatingComponent>
    </div>
  );
};

export default PengajuanContainer;
