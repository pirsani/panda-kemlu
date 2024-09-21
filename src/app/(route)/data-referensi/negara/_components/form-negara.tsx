"use client";
import { simpanDataNegara } from "@/actions/negara";
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
import { Negara, negaraSchema } from "@/zod/schemas/negara";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const FormNegara = () => {
  const form = useForm<Negara>({
    resolver: zodResolver(negaraSchema),
    defaultValues: {
      nama: "",
      namaInggris: "",
      kodeAlpha2: "",
      kodeAlpha3: "",
      kodeNumeric: "",
    },
  });

  const { handleSubmit } = form;
  const onSubmit = async (data: Negara) => {
    try {
      const negara = await simpanDataNegara(data);
      if (negara.success) {
        toast.success(
          `Berhasil menyimpan data negara ${negara.data?.kode} ${negara.data?.nama}`
        );
        form.reset();
      }
    } catch (error) {
      toast.error("Gagal menyimpan data negara");
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
              name="nama"
              render={({ field }) => (
                <FormItem className="w-full sm:w-1/3">
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="nama" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="namaInggris"
              render={({ field }) => (
                <FormItem className="w-full sm:w-1/3">
                  <FormLabel>Nama(EN)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama (EN)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kodeAlpha2"
              render={({ field }) => (
                <FormItem className="w-full sm:w-1/12">
                  <FormLabel>Kode Alpha2</FormLabel>
                  <FormControl>
                    <Input placeholder="AX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kodeAlpha3"
              render={({ field }) => (
                <FormItem className="w-full sm:w-1/12">
                  <FormLabel>Kode Alpha3</FormLabel>
                  <FormControl>
                    <Input placeholder="AXT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kodeNumeric"
              render={({ field }) => (
                <FormItem className="w-full sm:w-1/12">
                  <FormLabel>Kode Alpha3</FormLabel>
                  <FormControl>
                    <Input placeholder="007" {...field} />
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

export default FormNegara;
