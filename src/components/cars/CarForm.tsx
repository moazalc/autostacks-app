/* eslint-disable @typescript-eslint/no-explicit-any */
// path: components/cars/CarForm.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export type Car = {
  id?: string | undefined;
  make?: string | null | undefined;
  model?: string | null | undefined;
  year?: number | null | undefined;
  price?: number | null | undefined;
  buyPrice?: number | null | undefined;
  status?: string | null | undefined;
  vin?: string | null | undefined;
  imgUrl?: string | null | undefined;
};
export default function CarForm({
  initial = null,
  accountId,
  onSaved,
  onCancel,
}: {
  initial?: Car | null | undefined;
  accountId?: string | undefined;
  onSaved?: (car: Car) => void | Promise<void>;
  onCancel?: () => void;
}) {
  const [make, setMake] = useState(initial?.make ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [year, setYear] = useState<string>(
    initial?.year ? String(initial.year) : ""
  );
  const [price, setPrice] = useState<string>(
    initial?.price ? String(initial.price) : ""
  );
  const [buyPrice, setBuyPrice] = useState<string>(
    initial?.buyPrice ? String(initial.buyPrice) : ""
  );
  const [vin, setVin] = useState(initial?.vin ?? "");
  const [status, setStatus] = useState(initial?.status ?? "available");
  const [imgDataUrl, setImgDataUrl] = useState<string | null>(
    initial?.imgUrl ?? null
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // reset when initial changes (edit different item)
    setMake(initial?.make ?? "");
    setModel(initial?.model ?? "");
    setYear(initial?.year ? String(initial.year) : "");
    setPrice(initial?.price ? String(initial.price) : "");
    setBuyPrice(initial?.buyPrice ? String(initial.buyPrice) : "");
    setVin(initial?.vin ?? "");
    setStatus(initial?.status ?? "available");
    setImgDataUrl(initial?.imgUrl ?? null);
  }, [initial]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImgDataUrl(String(reader.result));
    };
    reader.readAsDataURL(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!make.trim() || !model.trim()) {
      toast.error("Please enter make and model");
      return;
    }
    setSaving(true);
    try {
      const body: any = {
        make: make.trim(),
        model: model.trim(),
        year: year ? Number(year) : null,
        price: price ? Number(price) : null,
        buyPrice: buyPrice ? Number(buyPrice) : null,
        vin: vin ? vin.trim() : null,
        status: status ?? null,
        imgUrl: imgDataUrl ?? null,
      };
      if (accountId) body.accountId = accountId;

      const method = initial?.id ? "PUT" : "POST";
      const url = initial?.id ? `/api/cars/${initial.id}` : `/api/cars`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Save failed");
      }

      const saved = await res.json();
      toast.success(initial?.id ? "Updated" : "Created");
      onSaved?.(saved);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-1">Make</Label>
        <Input
          value={make}
          onChange={(e) => setMake(e.target.value)}
          placeholder="Toyota"
        />
      </div>

      <div>
        <Label className="mb-1">Model</Label>
        <Input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Camry"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="mb-1">Year</Label>
          <Input
            value={year}
            onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
            placeholder="2022"
          />
        </div>
        <div>
          <Label className="mb-1">VIN</Label>
          <Input
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            placeholder="Stock ID / VIN"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="mb-1">Buy Price</Label>
          <Input
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="15000"
          />
        </div>
        <div>
          <Label className="mb-1">Sell Price</Label>
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="18000"
          />
        </div>
      </div>

      <div>
        <Label className="mb-1">Status</Label>
        <Select
          value={status ?? ""}
          onValueChange={(v: string) => setStatus(v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-1">Notes</Label>
        <Textarea placeholder="Optional notes..." />
      </div>

      <div>
        <Label className="mb-1">Image</Label>
        <div className="flex gap-2 items-center">
          <Input type="file" accept="image/*" onChange={onFile} />
          <Button
            variant="ghost"
            type="button"
            className="text-sm underline cursor-pointer "
            onClick={() => setImgDataUrl(null)}
          >
            Clear
          </Button>
        </div>
        {imgDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgDataUrl}
            alt="preview"
            className="mt-2 w-48 h-32 object-cover rounded-md"
          />
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : initial?.id ? "Save changes" : "Create car"}
        </Button>
      </div>
    </form>
  );
}
