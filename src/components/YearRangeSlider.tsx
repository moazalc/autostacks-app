/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = {
  min?: number; // allowed minimum (UI)
  max?: number; // allowed maximum (UI)
  value?: { from?: number | null; to?: number | null };
  onChange?: (next: { from?: number | null; to?: number | null }) => void;
  className?: string;
};

export default function YearRangeInputs({
  min = 1900,
  max = new Date().getFullYear(),
  value = { from: undefined, to: undefined },
  onChange,
  className = "",
}: Props) {
  const from = value.from ?? "";
  const to = value.to ?? "";

  function setFrom(raw: string) {
    const n = raw === "" ? null : Number(raw);
    // If user typed invalid number, keep it null
    const nextFrom =
      n === null || Number.isNaN(n) ? null : Math.max(min, Math.min(n, max));
    const nextTo = value.to == null ? null : value.to;
    // ensure from <= to if to exists
    if (nextTo != null && nextFrom != null && nextFrom > nextTo) {
      // if user set from > to, clamp from to to
      onChange?.({ from: nextTo, to: nextTo });
    } else {
      onChange?.({ from: nextFrom ?? undefined, to: nextTo ?? undefined });
    }
  }

  function setTo(raw: string) {
    const n = raw === "" ? null : Number(raw);
    const nextTo =
      n === null || Number.isNaN(n) ? null : Math.max(min, Math.min(n, max));
    const nextFrom = value.from == null ? null : value.from;
    // ensure from <= to if from exists
    if (nextFrom != null && nextTo != null && nextTo < nextFrom) {
      onChange?.({ from: nextFrom, to: nextFrom });
    } else {
      onChange?.({ from: nextFrom ?? undefined, to: nextTo ?? undefined });
    }
  }

  return (
    <div className={`grid grid-cols-2 gap-3 items-end ${className}`}>
      <Label className="block">
        <span className="text-sm text-muted-foreground">From</span>
        <Input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={from as any}
          onChange={(e) => setFrom(e.target.value)}
          placeholder={`${min}`}
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          aria-label="Year from"
        />
      </Label>

      <Label className="block">
        <span className="text-sm text-muted-foreground">To</span>
        <Input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={to as any}
          onChange={(e) => setTo(e.target.value)}
          placeholder={`${max}`}
          className="mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          aria-label="Year to"
        />
      </Label>
    </div>
  );
}
