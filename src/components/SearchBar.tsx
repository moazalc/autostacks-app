// path: components/ui/SearchInput.tsx
"use client";
import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";

export default function SearchBar({
  value: controlledValue,
  onChange,
  placeholder = "Search Cars, Entries...",
}: {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = React.useState<string>(controlledValue ?? "");

  React.useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== value) {
      setValue(controlledValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    onChange?.(e.target.value);
  }

  function handleClear() {
    setValue("");
    onChange?.("");
  }

  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-10 pr-10"
      />

      {value ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
