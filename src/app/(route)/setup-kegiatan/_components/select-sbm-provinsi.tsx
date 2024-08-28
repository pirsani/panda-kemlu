"use client";
import { getOptionsProvinsi } from "@/actions/sbm";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface SelectSbmProvinsiProps {
  fullKey: string;
  onChange: (value: number | null) => void;
  value: number | null;
}

interface Option {
  value: number;
  label: string;
}

const SelectSbmProvinsi = ({
  fullKey,
  onChange,
  value,
}: SelectSbmProvinsiProps) => {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionProvinsi = await getOptionsProvinsi();
      if (optionProvinsi) {
        const mappedOptions = optionProvinsi.map((provinsi) => ({
          value: provinsi.value,
          label: provinsi.label,
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
      menuPortalTarget={document.body} // Ensure the menu is rendered in the document body so it doesn't get clipped by overflow:hidden containers
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Ensure the menu has a high z-index
    />
  );
};

export default SelectSbmProvinsi;
