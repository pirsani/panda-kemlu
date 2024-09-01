"use client";
import { getOptionsKegiatan } from "@/actions/kegiatan";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectKegiatanProps {
  inputId: string;
  onChange?: (value: number | null) => void;
  value?: number;
}

interface Option {
  value: number;
  label: string;
}

const SelectKegiatan = ({
  inputId,
  onChange = () => {},
  value,
}: SelectKegiatanProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionKegiatan = await getOptionsKegiatan();
      if (optionKegiatan) {
        const mappedOptions = optionKegiatan.map((kegiatan) => ({
          value: kegiatan.value,
          label: kegiatan.label,
        }));
        setOptions(mappedOptions);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (value !== undefined) {
      const selected = options.find((option) => option.value === value) || null;
      setSelectedOption(selected);
    }
  }, [value, options]);

  const handleChange = (selected: SingleValue<Option>) => {
    setSelectedOption(selected);
    onChange(selected ? selected.value : null);
  };

  return (
    <Select
      inputId={inputId}
      instanceId={inputId}
      value={selectedOption}
      onChange={handleChange}
      options={options}
      isClearable
      menuPortalTarget={document.body} // Use state which is set after component mounts
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
    />
  );
};

export default SelectKegiatan;
