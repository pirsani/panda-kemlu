import { cn } from "@/lib/utils";
import { Narasumber, narasumberSchema } from "@/zod/schemas/narasumber";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import InputFile from "./input-file";

interface FormNarasumberProps {
  onCancel?: () => void;
  onSubmit?: (data: Narasumber) => void;
  className?: string;
}
const FormNarasumber = ({
  className,
  onCancel,
  onSubmit = () => {}, // Provide a default no-op function
}: FormNarasumberProps) => {
  const form = useForm<Narasumber>({
    resolver: zodResolver(narasumberSchema),
  });
  const { control, handleSubmit } = form;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <FormField
          name="nama"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <FormField
            name="id"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-1/3">
                <FormLabel>NIK</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="NIP"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-1/3">
                <FormLabel>NIP</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="NPWP"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-1/3">
                <FormLabel>NPWP</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <FormField
            name="jabatan"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-10/12">
                <FormLabel>Jabatan</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="pangkatGolonganId"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gol/Ruang</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="format III/A IV/C" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="eselon"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Eselon</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <FormField
            name="email"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="off" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="nomorTelepon"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <FormField
            name="bank"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-2/12">
                <FormLabel>Bank</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="namaRekening"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-7/12">
                <FormLabel>Nama Rekening</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="nomorRekening"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-3/12">
                <FormLabel>Nomor Rekening</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          name="pernyataanBedaRekening"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={field.name}>
                Pernyataan Beda Rekening (jika nama berbeda)
              </FormLabel>
              <FormControl>
                <InputFile
                  name={field.name}
                  onFileChange={(file) => field.onChange(file)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div
          className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
          )}
        >
          <Button type="submit">Submit</Button>
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormNarasumber;
