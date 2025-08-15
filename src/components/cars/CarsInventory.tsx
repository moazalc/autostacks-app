// components/cars/CarsInventory.tsx
"use client";

import React, { useMemo, useState } from "react";
import FiltersSidebar from "./FiltersSidebar";
import CarsHeader from "./CarsHeader";
import CarsTable from "./CarsTable";
import CarsGrid from "./CarsGrid";
import PaginationControls from "./PaginationControls";
import AddCarDialog from "./AddCarDialog";

import type { Car } from "./types";

// --- mock data (kept here for the demo) ---
const mockCars: Car[] = [
  {
    id: "1",
    make: "Toyota",
    model: "Camry",
    year: 2022,
    vin: "1HGBH41JXMN109186",
    stockId: "TC001",
    buyPrice: 22000,
    sellPrice: 25000,
    status: "available",
    imgUrl: "/placeholder.svg?height=64&width=96",
    notes: "Excellent condition, low mileage",
    dateAdded: "2024-01-15",
  },
  {
    id: "2",
    make: "Honda",
    model: "Civic",
    year: 2021,
    vin: "2HGFC2F59MH123456",
    stockId: "HC002",
    buyPrice: 18000,
    sellPrice: 21000,
    status: "sold",
    imgUrl: "/placeholder.svg?height=64&width=96",
    notes: "Great fuel economy",
    dateAdded: "2024-01-10",
  },
  {
    id: "3",
    make: "Ford",
    model: "F-150",
    year: 2023,
    vin: "1FTFW1ET5NFC12345",
    stockId: "FF003",
    buyPrice: 35000,
    sellPrice: 38000,
    status: "available",
    imgUrl: "/placeholder.svg?height=64&width=96",
    notes: "Popular truck model",
    dateAdded: "2024-01-20",
  },
];

export default function CarsInventory() {
  const [cars, setCars] = useState<Car[]>(mockCars);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  // filters shape
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    yearMin: "",
    yearMax: "",
    status: "all",
    priceMin: "",
    priceMax: "",
  });

  // derived: filtered list
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        car.make.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.vin?.toLowerCase().includes(q) ||
        car.stockId?.toLowerCase().includes(q);

      const matchesMake =
        !filters.make ||
        car.make.toLowerCase().includes(filters.make.toLowerCase());
      const matchesModel =
        !filters.model ||
        car.model.toLowerCase().includes(filters.model.toLowerCase());
      const matchesYearMin =
        !filters.yearMin || car.year >= Number.parseInt(filters.yearMin);
      const matchesYearMax =
        !filters.yearMax || car.year <= Number.parseInt(filters.yearMax);
      const matchesStatus =
        filters.status === "all" || car.status === filters.status;
      const matchesPriceMin =
        !filters.priceMin || car.buyPrice >= Number.parseInt(filters.priceMin);
      const matchesPriceMax =
        !filters.priceMax || car.buyPrice <= Number.parseInt(filters.priceMax);

      return (
        matchesSearch &&
        matchesMake &&
        matchesModel &&
        matchesYearMin &&
        matchesYearMax &&
        matchesStatus &&
        matchesPriceMin &&
        matchesPriceMax
      );
    });
  }, [cars, searchQuery, filters]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filteredCars.length / pageSize));
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // actions
  function handleMarkAsSold(id: string) {
    setCars((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "sold" } : c))
    );
  }
  function handleDelete(id: string) {
    setCars((prev) => prev.filter((c) => c.id !== id));
    setSelectedCars((s) => s.filter((x) => x !== id));
  }
  function handleSave(carData: Partial<Car>) {
    if (carData.id) {
      // edit
      setCars((prev) =>
        prev.map((c) =>
          c.id === carData.id ? ({ ...c, ...carData } as Car) : c
        )
      );
    } else {
      const newCar: Car = {
        id: Date.now().toString(),
        make: carData.make || "",
        model: carData.model || "",
        year: carData.year || new Date().getFullYear(),
        vin: carData.vin,
        stockId: carData.stockId,
        buyPrice: carData.buyPrice || 0,
        sellPrice: carData.sellPrice,
        status: (carData.status as Car["status"]) || "available",
        imgUrl: carData.imgUrl,
        notes: carData.notes,
        dateAdded: new Date().toISOString().split("T")[0],
      };
      setCars((prev) => [newCar, ...prev]);
    }
    setEditingCar(null);
    setIsAddOpen(false);
  }

  return (
    <div className="flex h-full">
      {showFilters && (
        <FiltersSidebar
          filters={filters}
          setFilters={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        <CarsHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          setShowFilters={setShowFilters}
          onAdd={() => setIsAddOpen(true)}
        />

        <div className="p-6 flex-1 overflow-auto">
          {paginatedCars.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-muted-foreground mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  {/* simple placeholder */}
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12h18" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No cars found</h3>
                <p>Add your first car to get started</p>
              </div>
            </div>
          ) : viewMode === "table" ? (
            <CarsTable
              cars={paginatedCars}
              selected={selectedCars}
              setSelected={setSelectedCars}
              onEdit={(c) => setEditingCar(c)}
              onDelete={handleDelete}
              onMarkAsSold={handleMarkAsSold}
            />
          ) : (
            <CarsGrid
              cars={paginatedCars}
              onEdit={(c) => setEditingCar(c)}
              onMarkAsSold={handleMarkAsSold}
            />
          )}

          <div className="mt-6">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              setPageSize={setPageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <AddCarDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={(c) => {
          handleSave(c);
        }}
      />

      {editingCar && (
        <AddCarDialog
          open={!!editingCar}
          initial={editingCar}
          onClose={() => setEditingCar(null)}
          onCreated={(c) => handleSave(c)}
        />
      )}
    </div>
  );
}
