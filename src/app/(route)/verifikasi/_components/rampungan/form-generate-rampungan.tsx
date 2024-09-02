"use client";
import { Button } from "@/components/ui/button";

const FormGenerateRampungan = ({
  kegiatanId,
}: {
  kegiatanId: number | null;
}) => {
  return (
    <div className="flex flex-col w-full ">
      <h1>Generate Rampungan</h1>
      <div className="flex flex-row gap-4 w-full">
        <Button type="button" className="grow">
          Generate
        </Button>
        <Button type="button" variant={"destructive"}>
          Selesai
        </Button>
      </div>
    </div>
  );
};

export default FormGenerateRampungan;
