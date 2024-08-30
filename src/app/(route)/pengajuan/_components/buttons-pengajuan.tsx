import { Button } from "@/components/ui/button";
import { JenisPengajuan } from "@/types";

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
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => handleSelection("generate-rampungan")}
        disabled={statusRampungan == "sudah-ada"}
      >
        Ajukan Generate Rampungan
      </Button>
      <Button variant="outline" onClick={() => handleSelection("honorarium")}>
        Ajukan Honorarium
      </Button>
      {lokasi != 2 && (
        <Button
          variant="outline"
          onClick={() => handleSelection("uh-dalam-negeri")}
          disabled={statusRampungan == "belum-ada"}
        >
          Ajukan UH Dalam Negeri
        </Button>
      )}
      {lokasi == 2 && (
        <Button
          variant="outline"
          onClick={() => handleSelection("uh-luar-negeri")}
          disabled={statusRampungan == "belum-ada"}
        >
          Ajukan UH Luar Negeri
        </Button>
      )}

      <Button
        variant="outline"
        onClick={() => handleSelection("penggantian-reinbursement")}
      >
        Ajukan Penggantian/Reinbursement
      </Button>
      <Button
        variant="outline"
        onClick={() => handleSelection("pembayaran-pihak-ke-3")}
      >
        Ajukan Pembayaran Pihak Ke-3
      </Button>
    </div>
  );
};

export default ButtonsPengajuan;
