// components/cars/FiltersSidebar.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

type Filters = {
  make: string;
  model: string;
  yearMin: string;
  yearMax: string;
  status: string;
  priceMin: string;
  priceMax: string;
};

export default function FiltersSidebar({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (fn: Filters | ((prev: Filters) => Filters)) => void;
  onClose?: () => void;
}) {
  return (
    <aside className="w-80 border-r bg-card p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="make-filter">Make</Label>
          <Input
            id="make-filter"
            placeholder="Toyota, Honda..."
            value={filters.make}
            onChange={(e) => setFilters({ ...filters, make: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="model-filter">Model</Label>
          <Input
            id="model-filter"
            placeholder="Camry, Civic..."
            value={filters.model}
            onChange={(e) => setFilters({ ...filters, model: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="year-min">Year Min</Label>
            <Input
              id="year-min"
              type="number"
              placeholder="2020"
              value={filters.yearMin}
              onChange={(e) =>
                setFilters({ ...filters, yearMin: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="year-max">Year Max</Label>
            <Input
              id="year-max"
              type="number"
              placeholder="2024"
              value={filters.yearMax}
              onChange={(e) =>
                setFilters({ ...filters, yearMax: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <Label htmlFor="status-filter">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="price-min">Price Min</Label>
            <Input
              id="price-min"
              type="number"
              placeholder="15000"
              value={filters.priceMin}
              onChange={(e) =>
                setFilters({ ...filters, priceMin: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="price-max">Price Max</Label>
            <Input
              id="price-max"
              type="number"
              placeholder="50000"
              value={filters.priceMax}
              onChange={(e) =>
                setFilters({ ...filters, priceMax: e.target.value })
              }
            />
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() =>
            setFilters({
              make: "",
              model: "",
              yearMin: "",
              yearMax: "",
              status: "all",
              priceMin: "",
              priceMax: "",
            })
          }
        >
          Clear Filters
        </Button>
      </div>
    </aside>
  );
}
