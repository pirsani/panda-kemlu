"use client";
import { useSearchParams } from "next/navigation";
import FormKegiatan from "./form-kegiatan";

const SetupKegiatanContainer = () => {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  return (
    <div>
      <h1>Setup Kegiatan Container</h1>
      <FormKegiatan editId={editId} />
    </div>
  );
};

export default SetupKegiatanContainer;
