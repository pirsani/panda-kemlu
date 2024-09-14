"use client";
import { getKegiatanById } from "@/actions/kegiatan";
import FloatingComponent from "@/components/floating-component";
import PreviewKegiatan from "@/components/kegiatan";
import PdfPreviewContainer from "@/components/pdf-preview-container";
import useFileStore from "@/hooks/use-file-store";
import { JenisPengajuan } from "@/types";
import { Kegiatan } from "@prisma-honorarium/client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import VerfikasiSelectionContainer from "./verifikasi-selection-container";
const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

const VerifikasiContainer = () => {
  const [kegiatanId, setKegiatanId] = useState<number | null>(null);
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);
  const { fileUrl, isPreviewHidden } = useFileStore();

  const handleKegiatanChange = (value: number | null) => {
    console.log(value);
    setKegiatanId(value); // after this set, it will trigger re-render PreviewKegiatan
  };
  const [jenisPengajuan, setJenisPengajuan] = useState<JenisPengajuan | null>();

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

  const handleOnHide = () => {
    useFileStore.setState({ isPreviewHidden: true });
  };

  return (
    <div className="relative flex flex-row w-full gap-6 pb-20">
      <div className="w-full sm:w-1/2 flex flex-col gap-2 ">
        <SelectKegiatan
          inputId="kegiatan"
          onChange={handleKegiatanChange}
          className="w-full"
        />
        <div className="flex flex-row gap-2 w-full border-gray-300 border rounded-md p-2 shadow-lg">
          <PreviewKegiatan kegiatan={kegiatan} className="w-full" />
        </div>
        <VerfikasiSelectionContainer kegiatan={kegiatan} />
      </div>
      <FloatingComponent hide={isPreviewHidden} onHide={handleOnHide}>
        <PdfPreviewContainer className="border-2 h-full border-gray-500" />
      </FloatingComponent>
    </div>
  );
};

export default VerifikasiContainer;
