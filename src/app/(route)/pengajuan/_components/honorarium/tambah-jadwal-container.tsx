import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

const TambahJadwalContainer = () => {
  return (
    <Button variant={"outline"}>
      <Plus size={12} />
      <span>Tambah Jadwal</span>
      <Calendar size={16} />
    </Button>
  );
};

export default TambahJadwalContainer;
