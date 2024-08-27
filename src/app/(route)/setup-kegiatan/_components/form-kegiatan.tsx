"use client";
import InputDatePicker from "@/components/date-picker/input-date-picker";
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
import kegiatanSchema, {
  Kegiatan,
  KegiatanEditMode,
  kegiatanSchemaEditMode,
} from "@/zod/schemas/kegiatan";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

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
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit: SubmitHandler<FormValues<FormMode>> = async (data) => {
    console.log(data.tanggalMulai); // Check the format here
    console.log(data);
  };

  return (
    <Form {...form}>
      {/* Map errors to a div */}
      {Object.keys(errors).length > 0 && (
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
                <FormLabel>Tanggal Mulai</FormLabel>
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
                <FormLabel>Tanggal Selesai</FormLabel>
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
        <Button type="submit" variant={"outline"}>
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default FormKegiatan;
