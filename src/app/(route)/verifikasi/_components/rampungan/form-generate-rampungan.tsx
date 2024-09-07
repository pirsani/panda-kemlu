"use client";
import { updateStatusRampungan } from "@/actions/kegiatan/proses";
import { Button } from "@/components/ui/button";
import { Kegiatan } from "@prisma-honorarium/client";

interface FormGenerateRampunganProps {
  kegiatanId: number;
  handleSelesai?: (kegiatan: Kegiatan) => void;
  handleGenerate?: () => void;
}
const FormGenerateRampungan = ({
  kegiatanId,
  handleGenerate = () => {},
  handleSelesai = () => {},
}: FormGenerateRampunganProps) => {
  const handleClickSelesai = async () => {
    const updateStatus = await updateStatusRampungan(kegiatanId, "selesai");
    if (updateStatus.success) {
      handleSelesai(updateStatus.data);
      console.log("[updateStatus]", updateStatus);
    }
  };

  const handleClickGenerate = async () => {
    // const updateStatus = await updateStatusRampungan(kegiatanId, "selesai");
    // if (updateStatus.success) {
    //   handleSelesai(updateStatus.data);
    //   console.log("[updateStatus]", updateStatus);
    // }
    window.open(`/download/dokumen-rampungan/${kegiatanId}`, "_blank"); // Open new window
  };
  return (
    <div className="flex flex-col w-full ">
      <h1>Generate Rampungan</h1>
      <div className="flex flex-row gap-4 w-full">
        <Button type="button" className="grow" onClick={handleClickGenerate}>
          Generate
        </Button>
        <Button
          type="button"
          variant={"destructive"}
          onClick={handleClickSelesai}
        >
          Selesai
        </Button>
      </div>
    </div>
  );
};

export default FormGenerateRampungan;
