import { simpanPejabatPerbendaharaan } from "@/actions/pejabat-perbendaharaan";
import FormPejabatPerbendaharaan from "@/components/form/form-pejabat-perbendaharaan";
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
import { PejabatPerbendaharaan as ZPejabatPerbendaharaan } from "@/zod/schemas/pejabat-perbendaharaan";
import { Contact, GraduationCap, Plus, Signature } from "lucide-react";
import { useState } from "react";

export const DialogFormPejabatPerbendaharaan = () => {
  const [open, setOpen] = useState(false);
  const onCancel = () => {
    setOpen(false);
  };

  const onSubmit = async (data: ZPejabatPerbendaharaan) => {
    // tidak ada file makan tidak perlu diubah menjadi form data
    const simpan = await simpanPejabatPerbendaharaan(data);
    if (!simpan.success) {
      console.error("Gagal menyimpan pejabatPerbendaharaan:", simpan.error);
      alert(`Gagal menyimpan pejabatPerbendaharaan ${simpan.message}`);
      return;
    } else {
      alert("Berhasil menyimpan pejabatPerbendaharaan");
      console.log("Berhasil menyimpan pejabatPerbendaharaan");
    }
    console.log(data);
    // Close dialog
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="gap-1">
          <Plus size={12} />
          <Contact size={24} />
          <span className="hidden sm:block">Pejabat Perbendaharaan</span>
          <Signature className="block sm:hidden" size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[750px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Pejabat Perbendaharaan</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan pejabat perbendaharaan baru
          </DialogDescription>
        </DialogHeader>
        <FormPejabatPerbendaharaan onCancel={onCancel} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
};

export default DialogFormPejabatPerbendaharaan;
