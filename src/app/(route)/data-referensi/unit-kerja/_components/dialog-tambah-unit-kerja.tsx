"use client";
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
import { BookOpen, GraduationCap, Grid, Plus } from "lucide-react";
import { useState } from "react";
import FormUnitKerja from "./form-unit-kerja";

export const DialogTambahUnitKerja = () => {
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
        <Button className="gap-1 w-36">
          <Plus size={18} />
          <Grid size={18} />
          <span className="hidden sm:block">Unit Kerja</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[500px]">
        <DialogHeader>
          <DialogTitle>Unit Kerja</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan UnitKerja baru
          </DialogDescription>
        </DialogHeader>
        <FormUnitKerja
          onCancel={onCancel}
          handleFormSubmitComplete={handleFormSubmitComplete}
        />
      </DialogContent>
    </Dialog>
  );
};
