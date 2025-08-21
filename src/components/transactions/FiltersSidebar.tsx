/* eslint-disable @typescript-eslint/no-explicit-any */
// path: components/filters/FiltersSidebar.tsx
"use client";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import DateRangePicker, { DateRange } from "../DateRangePicker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EntriesFilters({
  onChange,
  initial = {},
}: {
  onChange?: (filters: Record<string, any>) => void;
  initial?: Record<string, any>;
}) {
  const [filters, setFilters] = useState({
    yearMin: initial.yearMin,
    yearMax: initial.yearMax,
    buyDate: (initial.buyDate as DateRange) ?? { from: null, to: null },
    sellDate: (initial.sellDate as DateRange) ?? { from: null, to: null },
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (next: Partial<typeof filters>) => {
    const merged = { ...filters, ...next };
    setFilters(merged);
    onChange?.(merged);
  };

  // The full filters grid (used for desktop & expanded mobile)
  const FullFilters = (
    <aside className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-2">
        <h1 className="text-lg font-semibold">Filters</h1>
      </div>
      <div className="col-span-2 md:col-auto">
        <Label className="mb-2">Entry Type</Label>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="credit">Credit</SelectItem>
              <SelectItem value="debit">Debit</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-2 md:col-auto">
        <Label className="mb-2">Status</Label>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <DateRangePicker
          label="Date Range"
          value={filters.buyDate}
          onChange={(next) => update({ buyDate: next })}
        />
      </div>

      <div className="col-span-2">
        <Button
          variant="destructive"
          onClick={() =>
            update({
              yearMin: undefined,
              yearMax: undefined,
              buyDate: { from: null, to: null },
              sellDate: { from: null, to: null },
            })
          }
          className="w-full"
        >
          Clear
        </Button>
      </div>
    </aside>
  );

  return (
    <div>
      {/* Desktop behavior: sticky narrow panel fixed within layout (no page changes needed) */}
      <div className="hidden md:block md:w-90 md:sticky md:top-20 md:h-[calc(100vh-5rem)] md:overflow-auto ">
        {/* Padding inside to match previous spacing */}
        <div className="p-4 border-r">{FullFilters}</div>
      </div>

      {/* Mobile behavior: compact horizontal bar + expandable full filters below when opened */}
      <div className="block md:hidden">
        <div className="flex items-center gap-2 p-3 bg-transparent">
          <div className="flex-1">
            <Input placeholder="Search make, model, VIN..." />
          </div>
          <Button
            onClick={() => setMobileOpen((s) => !s)}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "Close" : "Filters"}
          </Button>
        </div>

        {/* Collapsible full filters on mobile */}
        {mobileOpen && (
          <div className="p-3 border-t bg-white">{FullFilters}</div>
        )}
      </div>
    </div>
  );
}
