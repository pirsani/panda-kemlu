import FormNarasumber from "@/components/form/form-narasumber";
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
import { Narasumber } from "@/zod/schemas/narasumber";
import { GraduationCap, Plus } from "lucide-react";
import { useState } from "react";

const TambahNarasumber = () => {
  const [open, setOpen] = useState(false);
  const onCancel = () => {
    setOpen(false);
  };

  const onSubmit = async (data: Narasumber) => {
    // Call API to save data
    // Close dialog
    console.log(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="gap-1">
          <Plus size={12} />
          <span>Tambah Narasumber</span>
          <GraduationCap size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[750px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Narasumber</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan narasumber baru
          </DialogDescription>
        </DialogHeader>
        <FormNarasumber onCancel={onCancel} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
};

export default TambahNarasumber;
