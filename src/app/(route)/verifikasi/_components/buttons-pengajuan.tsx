import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { JenisPengajuan } from "@/types";
import { useState } from "react";

interface ButtonsPengajuanProps {
  handleSelection: (jenis: JenisPengajuan) => void;
  lokasi: number;
  statusRampungan: "belum-ada" | "sudah-ada";
}

const ButtonsPengajuan = ({
  handleSelection,
  lokasi,
  statusRampungan,
}: ButtonsPengajuanProps) => {
  const [jenisPengajuan, setJenisPengajuan] = useState<JenisPengajuan | null>();

  const handleOnClick = (jenis: JenisPengajuan) => {
    setJenisPengajuan(jenis);
    handleSelection(jenis);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => handleOnClick("generate-rampungan")}
        disabled={statusRampungan == "sudah-ada"}
        className={cn(
          "hover:bg-blue-400 hover:text-white",
          jenisPengajuan == "generate-rampungan" && "bg-blue-500 text-white"
        )}
      >
        Generate Rampungan
      </Button>
      <Button
        variant="outline"
        onClick={() => handleOnClick("honorarium")}
        className={cn(
          "hover:bg-blue-400 hover:text-white",
          jenisPengajuan == "honorarium" && "bg-blue-500 text-white"
        )}
      >
        Verifikasi Honorarium
      </Button>
      {lokasi != 2 && (
        <Button
          variant="outline"
          onClick={() => handleOnClick("uh-dalam-negeri")}
          disabled={statusRampungan == "belum-ada"}
          className={cn(
            "hover:bg-blue-400 hover:text-white",
            jenisPengajuan == "uh-dalam-negeri" && "bg-blue-500 text-white"
          )}
        >
          Verifikasi UH Dalam Negeri
        </Button>
      )}
      {lokasi == 2 && (
        <Button
          variant="outline"
          onClick={() => handleOnClick("uh-luar-negeri")}
          disabled={statusRampungan == "belum-ada"}
          className={cn(
            "hover:bg-blue-400 hover:text-white",
            jenisPengajuan == "uh-luar-negeri" && "bg-blue-500 text-white"
          )}
        >
          Verifikasi UH Luar Negeri
        </Button>
      )}

      <Button
        variant="outline"
        onClick={() => handleOnClick("penggantian-reinbursement")}
        className={cn(
          "hover:bg-blue-400 hover:text-white",
          jenisPengajuan == "penggantian-reinbursement" &&
            "bg-blue-500 text-white"
        )}
      >
        Verifikasi Penggantian/Reinbursement
      </Button>
      <Button
        variant="outline"
        onClick={() => handleOnClick("pembayaran-pihak-ke-3")}
        className={cn(
          "hover:bg-blue-400 hover:text-white",
          jenisPengajuan == "pembayaran-pihak-ke-3" && "bg-blue-500 text-white"
        )}
      >
        Verifikasi Pembayaran Pihak Ke-3
      </Button>
    </div>
  );
};

export default ButtonsPengajuan;
