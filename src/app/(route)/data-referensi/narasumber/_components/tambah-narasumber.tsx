import simpanNarasumber from "@/actions/narasumber";
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
    // convert data dari zod schema ke FormData, g bisa langsung karena ada file, klo tidak ada file bisa langsung simpan data
    const formData = new FormData();
    // append the data to the form data
    // formData.append("data", JSON.stringify(dataWithoutFile));
    // dataWithoutFile
    const { dokumenPeryataanRekeningBerbeda, ...dataWithoutFile } = data;
    for (const [key, value] of Object.entries(dataWithoutFile)) {
      if (typeof value === "string") {
        formData.append(key, value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    }

    formData.append(
      "dokumenPeryataanRekeningBerbeda",
      dokumenPeryataanRekeningBerbeda as File
    );
    const simpan = await simpanNarasumber(formData);
    if (!simpan.success) {
      console.error("Error saving narasumber:", simpan.error);
      alert(`Gagal menyimpan narasumber ${simpan.message}`);
      return;
    } else {
      alert("Berhasil menyimpan narasumber");
      console.log("Berhasil menyimpan narasumber");
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
          <span className="hidden sm:block">Narasumber</span>
          <GraduationCap size={24} />
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
