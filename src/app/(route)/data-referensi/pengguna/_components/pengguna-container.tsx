"use client";
import { PenggunaWithRoles } from "@/actions/pengguna";
import { Pengguna as ZUnitkerja } from "@/zod/schemas/pengguna";
import { useState } from "react";
import { DialogFormPengguna } from "./dialog-form-pengguna";
import FormPengguna from "./form-pengguna";
import TabelPengguna from "./tabel-pengguna";

interface PenggunaContainerProps {
  data: PenggunaWithRoles[];
  optionsRole: { value: string; label: string }[];
  optionsUnitKerja: { value: string; label: string }[];
}
const PenggunaContainer = ({
  data,
  optionsRole,
  optionsUnitKerja,
}: PenggunaContainerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editableRow, setEditableRow] = useState<ZUnitkerja | null>(null);

  const onEdit = (row: PenggunaWithRoles) => {
    //const { createdAt, updatedAt, ...omittedData } = row;
    setIsOpen(true);
    setEditableRow(row as ZUnitkerja);
    console.log("onEdit form-narasumber-container", row);
  };

  const handleOnClose = () => {
    setIsOpen(false);
    setEditableRow(null);
  };

  const handleFormSubmitComplete = () => {
    setIsOpen(false);
    setEditableRow(null);
  };

  return (
    <>
      <DialogFormPengguna open={isOpen} setOpen={setIsOpen}>
        <FormPengguna
          onCancel={handleOnClose}
          handleFormSubmitComplete={handleFormSubmitComplete}
          pengguna={editableRow}
        />
      </DialogFormPengguna>

      <TabelPengguna data={data} optionsRole={optionsRole} onEdit={onEdit} />
    </>
  );
};

export default PenggunaContainer;
