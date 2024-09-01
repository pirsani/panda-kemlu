"use client";
import FloatingComponent from "@/components/floating-component";
import PreviewKegiatan from "@/components/kegiatan";
import PdfPreviewContainer from "@/components/pdf-preview-container";
//import SelectKegiatan from "@/components/form/select-kegiatan";
import dynamic from "next/dynamic";
import { useState } from "react";
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
  return (
    <div className="relative flex flex-col w-full gap-6">
      <SelectKegiatan inputId="kegiatan" onChange={handleKegiatanChange} />
      <div className="flex flex-row gap-2 w-full border-gray-300 border rounded-md p-2 shadow-lg">
        <PreviewKegiatan id={kegiatan} className="w-1/2 " />
      </div>
      <FloatingComponent>
        <div className="w-full border-2 ">
          <PdfPreviewContainer className="border-2 border-gray-500" />
        </div>
      </FloatingComponent>
    </div>
  );
};

export default VerifikasiContainer;
