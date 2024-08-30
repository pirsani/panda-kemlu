import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "./kelas-data-table";
import { columns, Payment } from "./kelas-table-columns";

const KelasContainer = () => {
  const data: Payment[] = [
    {
      id: "1",
      amount: 1000,
      status: "pending",
      email: "asdsa@email.com",
    },
    {
      id: "2",
      amount: 2000,
      status: "processing",
      email: "sdsd@asd.com",
    },
  ];

  return (
    <div>
      <Button>
        <Plus size={16} />
        <span>Tambah Kelas</span>
      </Button>
      <div>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default KelasContainer;
