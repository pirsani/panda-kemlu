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
        onClick={() => handleOnClick("GENERATE_RAMPUNGAN")}
        disabled={statusRampungan == "sudah-ada"}
        className={cn(
          "hover:bg-blue-400 hover:text-white",
          jenisPengajuan == "GENERATE_RAMPUNGAN" && "bg-blue-500 text-white"
        )}
      >
        Generate Rampungan
      </Button>
      <Button
        variant="outline"
        onClick={() => handleOnClick("HONORARIUM")}
        className={cn(
          "hover:bg-blue-400 hover:text-white",
          jenisPengajuan == "HONORARIUM" && "bg-blue-500 text-white"
        )}
      >
        Verifikasi Honorarium
      </Button>
      {lokasi != 2 && (
        <Button
          variant="outline"
          onClick={() => handleOnClick("UH_DALAM_NEGERI")}
          disabled={statusRampungan == "belum-ada"}
          className={cn(
            "hover:bg-blue-400 hover:text-white",
            jenisPengajuan == "UH_DALAM_NEGERI" && "bg-blue-500 text-white"
          )}
        >
          Verifikasi UH Dalam Negeri
        </Button>
      )}
      {lokasi == 2 && (
        <Button
          variant="outline"
          onClick={() => handleOnClick("UH_LUAR_NEGERI")}
          disabled={statusRampungan == "belum-ada"}
          className={cn(
            "hover:bg-blue-400 hover:text-white",
            jenisPengajuan == "UH_LUAR_NEGERI" && "bg-blue-500 text-white"
          )}
        >
          Verifikasi UH Luar Negeri
        </Button>
      )}

      <Button
        variant="outline"
        onClick={() => handleOnClick("PENGGANTIAN_REINBURSEMENT")}
        className={cn(
          "hover:bg-blue-400 hover:text-white",
          jenisPengajuan == "PENGGANTIAN_REINBURSEMENT" &&
            "bg-blue-500 text-white"
        )}
      >
        Verifikasi Penggantian/Reinbursement
      </Button>
      <Button
        variant="outline"
        onClick={() => handleOnClick("PEMBAYARAN_PIHAK_KETIGA")}
        className={cn(
          "hover:bg-blue-400 hover:text-white",
          jenisPengajuan == "PEMBAYARAN_PIHAK_KETIGA" &&
            "bg-blue-500 text-white"
        )}
      >
        Verifikasi Pembayaran Pihak Ke-3
      </Button>
    </div>
  );
};

export default ButtonsPengajuan;
