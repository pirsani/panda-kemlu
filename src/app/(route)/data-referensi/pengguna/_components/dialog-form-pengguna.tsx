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
import { UnitKerja as ZUnitkerja } from "@/zod/schemas/unit-kerja";
import { BookOpen, GraduationCap, Grid, Plus } from "lucide-react";
import { Chicle } from "next/font/google";
import { Children, useEffect, useState } from "react";

interface DialogFormPenggunaProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children?: React.ReactNode;
}
export const DialogFormPengguna = ({
  open,
  setOpen,
  children,
}: DialogFormPenggunaProps) => {
  useEffect(() => {
    setOpen(open);
  }, [open, setOpen]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 w-36">
          <Plus size={18} />
          <Grid size={18} />
          <span className="hidden sm:block">Pengguna</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[500px] max-h-[calc(100vh-50px)] overflow-auto">
        <DialogHeader>
          <DialogTitle>Pengguna</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan/mengubah Pengguna
          </DialogDescription>
        </DialogHeader>
        <div className="w-full max-w-full overflow-hidden p-1">{children}</div>
      </DialogContent>
    </Dialog>
  );
};
