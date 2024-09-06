"use client";
import { useSearchParams } from "next/navigation";
import FormKegiatan from "./form-kegiatan";

const SetupKegiatanContainer = () => {
  // const searchParams = useSearchParams();
  // const editId = searchParams.get("edit");
  const editId = null;
  return (
    <div>
      <h1 className="mb-6">Alur Proses &gt; 0 Setup Kegiatan </h1>
      <FormKegiatan editId={editId} />
    </div>
  );
};

export default SetupKegiatanContainer;
