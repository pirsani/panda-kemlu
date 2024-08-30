import { Button } from "@/components/ui/button";
import { Book, Calendar, File, Plus, Users2 } from "lucide-react";
import { DataTable } from "./kelas-data-table";
import { columns, Kelas } from "./kelas-table-columns";

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
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Button variant={"outline"}>
          <Plus size={12} />
          <span>Tambah Jadwal</span>
          <Calendar size={16} />
        </Button>
        <Button variant={"outline"}>
          <Plus size={12} />
          <span>Tambah Kelas</span>
          <Users2 size={16} />
        </Button>
        <Button variant={"outline"}>
          <Plus size={12} />
          <span>Tambah Materi</span>
          <Book size={16} />
        </Button>
      </div>

      <div>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default KelasContainer;
