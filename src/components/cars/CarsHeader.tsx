// components/cars/CarsHeader.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Grid3X3, List, Filter } from "lucide-react";
import AddCarDialog from "./AddCarDialog";

export default function CarsHeader({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  setShowFilters,
  onAdd,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: "table" | "grid";
  setViewMode: (v: "table" | "grid") => void;
  // <-- accept a dispatcher so callers can use functional updater
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  onAdd: () => void;
}) {
  return (
    <div className="border-b bg-card p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Cars</h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search make, model, VIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-l-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((prev) => !prev)} // now correctly typed
            className="lg:hidden"
          >
            <Filter className="h-4 w-4" />
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Car
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Car</DialogTitle>
              </DialogHeader>
              <AddCarDialog />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
