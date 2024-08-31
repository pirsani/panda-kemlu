"use client";
import { getOptionsKelas } from "@/actions/honorarium";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectKelasProps {
  fullKey: string;
  onChange: (value: number | null) => void;
  value: number | null;
}

interface Option {
  value: number;
  label: string;
}

const SelectKelas = ({ fullKey, onChange, value }: SelectKelasProps) => {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionKelas = await getOptionsKelas();
      if (optionKelas) {
        const mappedOptions = optionKelas.map((kelas) => ({
          value: kelas.value,
          label: kelas.label,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, []);

  return (
    <Select
      instanceId={fullKey}
      options={options}
      isClearable
      onChange={(option: SingleValue<Option>) =>
        onChange(option ? option.value : null)
      }
      value={options.find((option) => option.value === value) || null}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value.toString()}
      filterOption={(option, inputValue) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      }
      //menuPortalTarget={document.body} // Ensure the menu is rendered in the document body so it doesn't get clipped by overflow:hidden containers
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Ensure the menu has a high z-index
    />
  );
};

export default SelectKelas;
