import { getKegiatan, getOptionsKegiatan } from "@/actions/kegiatan";
import { getMateri } from "@/actions/materi";
import { get } from "lodash";
import FormMateri from "./_components/form-materi";
import { TabelMateri } from "./_components/tabel-materi";

const MateriPage = async () => {
  const data = await getMateri();
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Materi </h1>
      <FormMateri />
      <TabelMateri data={data} />
    </div>
  );
};

export default MateriPage;
