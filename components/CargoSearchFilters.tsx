import React, { useEffect, useRef, useState } from "react";
import {
  cargoServiceOptions,
  cargoTypeOptions,
  cargoVehicleTypeOptions,
} from "../data/cargoOptions";

const cargoFilterGroups = [
  {
    label: "Тип груза",
    options: cargoTypeOptions,
    className: "cargo-filter-select--type",
  },
  {
    label: "Тип транспорта",
    options: cargoVehicleTypeOptions,
    className: "cargo-filter-select--vehicle",
  },
  {
    label: "Дополнительные услуги",
    options: cargoServiceOptions,
    className: "cargo-filter-select--services",
  },
];

const CargoSearchFilters: React.FC = () => (
  <div className="cargo-filters-row">
    {cargoFilterGroups.map((group) => (
      <CargoFilterDropdown
        key={group.label}
        label={group.label}
        options={group.options}
        className={group.className}
      />
    ))}
  </div>
);

type CargoFilterDropdownProps = {
  label: string;
  options: string[];
  className: string;
};

const CargoFilterDropdown: React.FC<CargoFilterDropdownProps> = ({
  label,
  options,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonLabel = selectedOption || label;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`cargo-filter-select ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="cargo-filter-select__button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{buttonLabel}</span>
      </button>

      {isOpen && (
        <div className="cargo-filter-select__menu" role="listbox">
          {options.map((option) => (
            <button
              type="button"
              className="cargo-filter-select__item"
              key={option}
              role="option"
              aria-selected={selectedOption === option}
              onClick={() => {
                setSelectedOption(option);
                setIsOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CargoSearchFilters;
