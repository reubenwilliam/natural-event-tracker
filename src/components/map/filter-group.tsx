"use client";

import { Checkbox } from "../ui/checkbox";

interface FilterGroupProps<T extends object> {
  label: string;
  items: T[];
  counts: Record<string, number>;
  selected: string[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  onToggle: (id: string) => void;
}

const FilterGroup = <T extends object>({
  label,
  items,
  counts,
  selected,
  getId,
  getLabel,
  onToggle,
}: FilterGroupProps<T>) => {
  return (
    <div className="flex flex-col items-start gap-2 p-1">
      <div className="border-b border-primary/50 dark:border-primary w-full">
        <span className="font-number text-[11px] text-primary uppercase">
          {label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 pointer-events-auto">
        {items.map((item) => {
          const id = getId(item);
          const count = counts[id] || 0;
          const disabled = count === 0;

          return (
            <div
              key={id}
              className={`flex items-center gap-1 ${disabled ? "opacity-40" : ""}`}
            >
              <Checkbox
                checked={selected.includes(id)}
                onCheckedChange={() => onToggle(id)}
                disabled={disabled}
              />
              <span
                className="font-number text-[9px] truncate"
                title={getLabel(item)}
              >
                {getLabel(item)}
              </span>
              <span className="font-number text-[9px]">({count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FilterGroup;
