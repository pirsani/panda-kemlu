"use client";
import TambahNarasumber from "@/approute/data-referensi/narasumber/_components/tambah-narasumber";
import { NarasumberWithStringDate } from "@/data/narasumber";
import { useState } from "react";
import { TabelNarasumber } from "./tabel-narasumber";

interface FormNarasumberContainerProps {
  data: NarasumberWithStringDate[];
}
const FormNarasumberContainer = ({
  data: narasumber,
}: FormNarasumberContainerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div>
      <TambahNarasumber />
      <TabelNarasumber data={narasumber} />
    </div>
  );
};

export default FormNarasumberContainer;
