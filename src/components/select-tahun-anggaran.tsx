"use client";
import useTahunAnggaranStore from "@/hooks/use-tahun-anggaran-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SelectTahunAnggaran = () => {
  const {
    tahunAnggaran,
    setTahunAnggaranYear,
    initializeTahunAnggaran,
    initialized,
  } = useTahunAnggaranStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) {
      initializeTahunAnggaran();
    }
  }, []);

  // Check if tahunAnggaran is defined
  if (tahunAnggaran === undefined || tahunAnggaran === null) {
    return <div>Loading...</div>; // Render a loading state or nothing
  }

  return (
    <select
      value={tahunAnggaran ?? "2025"}
      onChange={async (e) => {
        await setTahunAnggaranYear(parseInt(e.target.value));
        router.refresh();
      }}
      className="appearance-none p-2 mx-4 rounded-sm font-semibold text-white bg-primary pr-8"
    >
      <option value="2024">2024</option>
      <option value="2025">2025</option>
      <option value="2026">2026</option>
      <option value="2027">2027</option>
      <option value="2028">2028</option>
      <option value="2029">2029</option>
    </select>
  );
};

export default SelectTahunAnggaran;
