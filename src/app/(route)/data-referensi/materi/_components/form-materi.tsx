"use client";
import { simpanDataMateri } from "@/actions/materi";
//import SelectKegiatan from "@/components/form/select-kegiatan";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Materi, materiSchema } from "@/zod/schemas/materi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const FormMateri = () => {
  const form = useForm<Materi>({
    resolver: zodResolver(materiSchema),
    defaultValues: {
      kode: "",
      nama: "",
    },
  });

  const { handleSubmit } = form;
  const onSubmit = async (data: Materi) => {
    try {
      const materi = await simpanDataMateri(data);
      if (materi.success) {
        toast.success(
          `Berhasil menyimpan data materi ${materi.data?.kode} ${materi.data?.nama}`
        );
        form.reset();
      }
    } catch (error) {
      toast.error("Gagal menyimpan data materi");
    }
    console.log(data);
  };
  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <FormField
              control={form.control}
              name="kode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode</FormLabel>
                  <FormControl>
                    <Input placeholder="[PDK-BXYZN]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem className="w-full sm:w-1/3">
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Materi [A-Z]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className=" flex flex-auto items-end">
              <Button type="submit">Tambah</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormMateri;
