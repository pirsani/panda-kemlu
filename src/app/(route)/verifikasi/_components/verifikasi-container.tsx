"use client";
import FloatingComponent from "@/components/floating-component";
import PreviewKegiatan from "@/components/kegiatan";
import PdfPreviewContainer from "@/components/pdf-preview-container";
//import SelectKegiatan from "@/components/form/select-kegiatan";
import { Button } from "@/components/ui/button";
import { JenisPengajuan } from "@/types";
import dynamic from "next/dynamic";
import { useState } from "react";
import ButtonsPengajuan from "./buttons-pengajuan";
import VerfikasiSelectionContainer from "./verifikasi-selection-container";
const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

const VerifikasiContainer = () => {
  const [kegiatan, setKegiatan] = useState<number | null>(null);

  const handleKegiatanChange = (value: number | null) => {
    console.log(value);
    setKegiatan(value); // after this set, it will trigger re-render PreviewKegiatan
  };
  const [jenisPengajuan, setJenisPengajuan] = useState<JenisPengajuan | null>();
  const handleSelection = (jenis: JenisPengajuan) => {
    setJenisPengajuan(jenis);
  };
  return (
    <div className="relative flex flex-row w-full gap-6 pb-20">
      <div className="w-1/2 flex flex-col gap-2 ">
        <SelectKegiatan inputId="kegiatan" onChange={handleKegiatanChange} />
        <div className="flex flex-row gap-2 w-full border-gray-300 border rounded-md p-2 shadow-lg">
          <PreviewKegiatan id={kegiatan} className="w-full" />
        </div>
        <VerfikasiSelectionContainer kegiatan={kegiatan} />
      </div>
      <FloatingComponent>
        <PdfPreviewContainer className="border-2 h-full border-gray-500" />
      </FloatingComponent>
    </div>
  );
};

export default VerifikasiContainer;
