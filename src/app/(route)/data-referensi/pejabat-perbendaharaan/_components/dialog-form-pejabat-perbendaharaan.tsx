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
import { PejabatPerbendaharaan } from "@/zod/schemas/pejabat-perbendaharaan";
import { Contact, GraduationCap, Plus, Signature } from "lucide-react";
import { useState } from "react";

export const DialogFormPejabatPerbendaharaan = () => {
  const [open, setOpen] = useState(false);
  const onCancel = () => {
    setOpen(false);
  };

  const onSubmit = async (data: PejabatPerbendaharaan) => {
    // Call API to save data
    // convert data dari zod schema ke FormData, g bisa langsung karena ada file, klo tidak ada file bisa langsung simpan data
    const formData = new FormData();
    // append the data to the form data
    // formData.append("data", JSON.stringify(dataWithoutFile));
    // dataWithoutFile
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        formData.append(key, value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    }

    const simpan = await simpanPejabatPerbendaharaan(formData);
    if (!simpan.success) {
      console.error("Error saving pejabatPerbendaharaan:", simpan.error);
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
