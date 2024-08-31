import InputDatePicker from "@/components/form/date-picker/input-date-picker";
import FormFileUpload from "@/components/form/form-file-upload";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Jadwal, jadwalSchema } from "@/zod/schemas/jadwal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Plus, Users } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import SelectKelas from "./select-kelas";
import SelectMateri from "./select-materi";

const TambahJadwalContainer = () => {
  const [open, setOpen] = useState(false);
  const form = useForm<Jadwal>({
    resolver: zodResolver(jadwalSchema),
  });

  const {
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit: SubmitHandler<Jadwal> = async (data) => {
    console.log(data);
    // Call API to save data
    // Close dialog
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="gap-1">
          <Plus size={12} />
          <span>Tambah Jadwal</span>
          <Calendar size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Jadwal Kelas Pengajar</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan jadwal kelas pengajar
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="kelasId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="kelasId">Kelas</FormLabel>
                  <FormControl>
                    <SelectKelas
                      inputId={field.name}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="materiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="materiId">Materi</FormLabel>
                  <FormControl>
                    <SelectMateri
                      inputId={field.name}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tanggal"
              render={({ field }) => (
                <FormItem>
                  <InputDatePicker
                    name={field.name}
                    error={errors.tanggal}
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
              name="dokumenDaftarHadir"
              render={({ field }) => (
                <FormItem>
                  <label htmlFor="dokumenDaftarHadir">
                    Upload Nota Dinas/Memorandum/SK Tim
                  </label>
                  <FormControl>
                    <FormFileUpload name={field.name} className="bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dokumenSurat"
              render={({ field }) => (
                <FormItem>
                  <label htmlFor="dokumenSurat">
                    Upload Nota Dinas/Memorandum/SK Tim
                  </label>
                  <FormControl>
                    <FormFileUpload name={field.name} className="bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TambahJadwalContainer;
