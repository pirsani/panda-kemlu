import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Users } from "lucide-react";

const TambahMateriContainer = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <Plus size={12} />
          <span>Tambah Materi</span>
          <Users size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Materi</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan materi baru
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kode" className="text-right">
              Kode
            </Label>
            <Input id="kode" placeholder="[MK-01-001]" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nama" className="text-right">
              Nama
            </Label>
            <Input
              id="nama"
              placeholder="Entreprenurship"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TambahMateriContainer;
