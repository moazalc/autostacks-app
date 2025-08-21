/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Calendar } from "@/components/ui/calendar";

export type DateRange = { from: Date | null; to: Date | null };

function fmt(d?: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString();
}

export default function DateRangePicker({
  label,
  value,
  onChange,
  applyOnSelect = false,
}: {
  label?: string;
  value: DateRange;
  onChange: (next: DateRange) => void;
  /** If true, selecting on the calendar will immediately call onChange and close the popover */
  applyOnSelect?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {label && <Label className="mb-2">{label}</Label>}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex-1 justify-between">
              <span>{value.from ? fmt(value.from) : "From"}</span>
              <span className="text-sm text-muted-foreground">
                {value.to ? fmt(value.to) : "To"}
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent side="bottom" className="w-[340px] p-2">
            {/* Calendar used in range mode. Adjust if your Calendar API differs. */}
            <Calendar
              // If your Calendar expects `mode="range"` and `selected={{ from, to }}` with `onSelect`, this will work.
              mode="range"
              selected={{
                from: value.from ?? undefined,
                to: value.to ?? undefined,
              }}
              onSelect={(next: any) => {
                if (!next) {
                  onChange({ from: null, to: null });
                  return;
                }
                // support different shapes: array, {from,to}, single Date
                if (Array.isArray(next)) {
                  const [a, b] = next;
                  onChange({ from: a ?? null, to: b ?? null });
                  if (applyOnSelect) setOpen(false);
                  return;
                }
                if (next.from !== undefined || next.to !== undefined) {
                  onChange({ from: next.from ?? null, to: next.to ?? null });
                  if (applyOnSelect) setOpen(false);
                  return;
                }
                if (next instanceof Date) {
                  onChange({ from: next, to: next });
                  if (applyOnSelect) setOpen(false);
                  return;
                }
              }}
            />

            <div className="mt-2 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {value.from ? fmt(value.from) : "-"} →{" "}
                {value.to ? fmt(value.to) : "-"}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onChange({ from: null, to: null });
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          onClick={() => {
            onChange({ from: null, to: null });
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
