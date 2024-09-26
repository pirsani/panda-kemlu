"use client";
import { simpanPejabatPerbendaharaan } from "@/actions/pejabat-perbendaharaan";
import FormPejabatPerbendaharaan from "@/app/(route)/data-referensi/pejabat-perbendaharaan/_components/form-pejabat-perbendaharaan";
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
import { Contact, GraduationCap, Plus, Signature } from "lucide-react";
import { useState } from "react";

export const DialogTambahPejabatPerbendaharaan = () => {
  const [open, setOpen] = useState(false);
  const onCancel = () => {
    setOpen(false);
  };

  // Closes the dialog if the form submission is successful
  const handleFormSubmitComplete = (isSuccess: Boolean) => {
    if (isSuccess) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 w-64">
          <Plus size={18} />
          <Contact size={18} />
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
        <FormPejabatPerbendaharaan
          onCancel={onCancel}
          handleFormSubmitComplete={handleFormSubmitComplete}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DialogTambahPejabatPerbendaharaan;
