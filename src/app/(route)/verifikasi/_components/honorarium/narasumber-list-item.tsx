"use client";
import { Button } from "@/components/ui/button";
import { JadwalNarsum, Narsum } from "@/data/jadwal";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface NarasumberListItemProps {
  jadwal: JadwalNarsum;
  index: number;
  totalNarsum?: number;
}
export const NarasumberListItem = ({
  jadwal,
  index = 0,
  totalNarsum = 1,
}: NarasumberListItemProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detail, setDetail] = useState<Narsum | null>(null);
  const toggleDetail = () => {
    setIsDetailOpen((prevState) => !prevState);
  };
  return (
    <div
      className={cn(
        "flex flex-row w-full",
        index !== totalNarsum - 1 && "border-gray-300 border-b"
      )}
    >
      <Column>
        <Button
          variant={"ghost"}
          className="rounded-full w-9 h-9 p-0"
          onClick={toggleDetail}
        >
          <ChevronRight
            size={12}
            transform={isDetailOpen ? "rotate(90)" : "rotate(0)"}
          />
        </Button>
      </Column>
      <Column>{jadwal.narasumber.nama}</Column>
      <Column>{jadwal.narasumber.jabatan}</Column>
    </div>
  );
};

const Column = ({ children }: { children: React.ReactNode }) => {
  return <div className={cn("px-4 py-2")}>{children}</div>;
};

const NarsumDetail = ({ narsum }: { narsum: Narsum }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <label>Nama</label>
        <span>{narsum.nama}</span>
      </div>
      <div className="flex flex-row gap-2">
        <label>Jabatan</label>
        <span>{narsum.jabatan}</span>
      </div>
      <div className="flex flex-row gap-2">
        <label>Instansi</label>
        <span>nama instansi</span>
      </div>
    </div>
  );
};

export default NarasumberListItem;
