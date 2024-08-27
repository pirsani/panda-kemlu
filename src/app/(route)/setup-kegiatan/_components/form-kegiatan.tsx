"use client";
import InputDatePicker from "@/components/form/date-picker/input-date-picker";
import FormFileUpload from "@/components/form/form-file-upload";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useFileStore from "@/hooks/use-file-store";
import kegiatanSchema, {
  Kegiatan,
  KegiatanEditMode,
  kegiatanSchemaEditMode,
} from "@/zod/schemas/kegiatan";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import PesertaContainer from "./peserta-container";

type FormValues<T> = T extends true ? KegiatanEditMode : Kegiatan;

interface FormKegiatanProps {
  editId?: string | null;
}

export const FormKegiatan = ({ editId }: FormKegiatanProps) => {
  const isEditMode = editId !== null;
  type FormMode = typeof isEditMode;
  const form = useForm<FormValues<FormMode>>({
    resolver: zodResolver(isEditMode ? kegiatanSchemaEditMode : kegiatanSchema),
    defaultValues: {
      nama: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit: SubmitHandler<FormValues<FormMode>> = async (data) => {
    console.log(data.tanggalMulai); // Check the format here
    console.log(data);
  };

  const setFileUrl = useFileStore((state) => state.setFileUrl);

  const handleFileChange = (file: File | null) => {
    if (file !== null) {
      const fileUrl = URL.createObjectURL(file);
      console.log(fileUrl);
      setFileUrl(fileUrl);
    } else {
      setFileUrl(null);
    }
  };

  const handleUploadPeserta = (file: File | null) => {
    if (file !== null) {
      console.log("File is not null");
    } else {
      console.warn("File is null");
    }
  };

  const displayAllErrors = false;
  return (
    <Form {...form}>
      {/* Map errors to a div */}
      {Object.keys(errors).length > 0 && displayAllErrors && (
        <div className="bg-red-100 p-4 mt-4 rounded">
          <h3 className="text-red-500 font-bold mb-2">Form Errors:</h3>
          <ul className="list-disc list-inside text-red-500">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>
                {key}: {error?.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kegiatan</FormLabel>
              <FormControl>
                <Input placeholder="nama kegiatan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row w-full gap-2">
          <FormField
            control={form.control}
            name="tanggalMulai"
            render={({ field }) => (
              <FormItem>
                <label htmlFor="tanggalMulai">Tanggal Mulai</label>
                <InputDatePicker
                  name={field.name}
                  error={errors.tanggalMulai}
                  className="md:w-full"
                  calendarOptions={{
                    fromDate: new Date(new Date().getFullYear(), 0, 1),
                    toDate: new Date(new Date().getFullYear(), 11, 31),
                  }}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tanggalSelesai"
            render={({ field }) => (
              <FormItem>
                <label htmlFor="tanggalSelesai">Tanggal Selesai</label>
                <InputDatePicker
                  name={field.name}
                  error={errors.tanggalSelesai}
                  className="md:w-full"
                  calendarOptions={{
                    fromDate: new Date(new Date().getFullYear(), 0, 1),
                    toDate: new Date(new Date().getFullYear(), 11, 31),
                  }}
                />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="dokumenSurat"
          render={({ field }) => (
            <FormItem>
              <label htmlFor="dokumenSurat">
                Upload Nota Dinas/Memorandum/SK Tim
              </label>
              <FormControl>
                <FormFileUpload
                  name={field.name}
                  onFileChange={handleFileChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dokumenJadwal"
          render={({ field }) => (
            <FormItem>
              <label htmlFor="dokumenJadwal">
                Upload Nota Dinas/Memorandum/SK Tim
              </label>
              <FormControl>
                <FormFileUpload
                  name={field.name}
                  onFileChange={handleFileChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lokasi"
          render={({ field }) => (
            <FormItem>
              <label htmlFor={field.name}>Lokasi</label>
              <FormControl>
                <select
                  id="lokasi"
                  {...field}
                  className="border-2 border-gray-300 p-2 rounded w-full"
                >
                  <option value={0} className="p-2">
                    Dalam Kota
                  </option>
                  <option value={1} className="p-2">
                    Luar Kota
                  </option>
                  <option value={2} className="p-2">
                    Luar Negeri
                  </option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <PesertaContainer />
        <Button type="submit" variant={"outline"}>
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default FormKegiatan;
