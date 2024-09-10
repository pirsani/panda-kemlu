"use client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ExcelReferensiTemplate,
  excelReferensiTemplateSchema,
} from "@/zod/schemas/excel";
import { Narasumber } from "@/zod/schemas/narasumber";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import ExcelContainer from "../../_components/excel-container";

const FormUploadExcelNarasumber = () => {
  const form = useForm<ExcelReferensiTemplate>({
    resolver: zodResolver(excelReferensiTemplateSchema),
  });

  const {
    setValue,
    reset,
    resetField,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
  } = form;

  const extractFromColumns = [
    "ID",
    "Nama",
    "NIP",
    "NIK",
    "NPWP",
    "Golongan/Ruang",
    "Jabatan",
    "Eselon",
    "Nama Rekening",
    "Bank",
    "Nomor Rekening",
  ];
  const columnsWithEmptyValueAllowed = [
    "NIP",
    "Eselon",
    "Golongan/Ruang",
    "NPWP",
    "Nama Rekening",
    "Bank",
    "Nomor Rekening",
  ];

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ExcelContainer
                  templateXlsx="/template-narasumber.xlsx"
                  name={field.name}
                  value={field.value}
                  extractFromColumns={extractFromColumns}
                  columnsWithEmptyValueAllowed={columnsWithEmptyValueAllowed}
                  // onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default FormUploadExcelNarasumber;
