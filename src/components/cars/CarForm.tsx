// components/cars/CarForm.tsx
"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Car } from "./types";

export default function CarForm({
  car,
  onSave,
  onCancel,
}: {
  car?: Car | null;
  onSave: (data: Partial<Car>) => void;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState({
    id: car?.id,
    make: car?.make || "",
    model: car?.model || "",
    year: car?.year || new Date().getFullYear(),
    vin: car?.vin || "",
    stockId: car?.stockId || "",
    buyPrice: car?.buyPrice || 0,
    sellPrice: car?.sellPrice || 0,
    status: car?.status || "available",
    imgUrl: car?.imgUrl || "",
    notes: car?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="make">Make *</Label>
          <Input
            id="make"
            required
            value={formData.make}
            onChange={(e) =>
              setFormData((p) => ({ ...p, make: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            required
            value={formData.model}
            onChange={(e) =>
              setFormData((p) => ({ ...p, model: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            type="number"
            required
            min={1900}
            max={2030}
            value={String(formData.year)}
            onChange={(e) =>
              setFormData((p) => ({ ...p, year: Number(e.target.value) }))
            }
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) =>
              setFormData((p) => ({ ...p, status: v as "available" | "sold" }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vin">VIN</Label>
          <Input
            id="vin"
            value={formData.vin}
            onChange={(e) =>
              setFormData((p) => ({ ...p, vin: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="stockId">Stock ID</Label>
          <Input
            id="stockId"
            value={formData.stockId}
            onChange={(e) =>
              setFormData((p) => ({ ...p, stockId: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="buyPrice">Buy Price *</Label>
          <Input
            id="buyPrice"
            type="number"
            required
            value={String(formData.buyPrice)}
            onChange={(e) =>
              setFormData((p) => ({ ...p, buyPrice: Number(e.target.value) }))
            }
          />
        </div>
        <div>
          <Label htmlFor="sellPrice">Sell Price</Label>
          <Input
            id="sellPrice"
            type="number"
            value={String(formData.sellPrice || 0)}
            onChange={(e) =>
              setFormData((p) => ({ ...p, sellPrice: Number(e.target.value) }))
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="imgUrl">Image URL</Label>
        <Input
          id="imgUrl"
          value={formData.imgUrl}
          onChange={(e) =>
            setFormData((p) => ({ ...p, imgUrl: e.target.value }))
          }
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          rows={3}
          value={formData.notes || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, notes: e.target.value }))
          }
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Car</Button>
      </div>
    </form>
  );
}
