import { Button } from "@/components/ui/button";
import { Book, Calendar, File, Plus, Users2 } from "lucide-react";
import { DataTable } from "./kelas-data-table";
import { columns, Kelas } from "./kelas-table-columns";
import TambahJadwalContainer from "./tambah-jadwal-container";
import TambahKelasContainer from "./tambah-kelas-container";
import TambahMateriContainer from "./tambah-materi-container";
import TambahNarasumber from "./tambah-narasumber";

const KelasContainer = () => {
  const data: Kelas[] = [
    {
      id: "1",
      kelas: "Kelas A",
      tanggal: new Date(),
      materi: "Materi A",
    },
    {
      id: "1",
      kelas: "Kelas A",
      tanggal: new Date(),
      materi: "Materi A",
    },
  ];

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-row gap-2 w-full">
        <TambahJadwalContainer />
        <TambahKelasContainer />
        <TambahMateriContainer />
        <TambahNarasumber />
      </div>

      <div>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default KelasContainer;
