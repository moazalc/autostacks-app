/* eslint-disable @next/next/no-img-element */
// components/cars/CarsTable.tsx
"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, CheckCircle, Trash2 } from "lucide-react";
import type { Car } from "./types";

export default function CarsTable({
  cars,
  selected,
  setSelected,
  onEdit,
  onDelete,
  onMarkAsSold,
}: {
  cars: Car[];
  selected: string[];
  setSelected: (ids: string[]) => void;
  onEdit: (c: Car) => void;
  onDelete: (id: string) => void;
  onMarkAsSold: (id: string) => void;
}) {
  const allSelected = selected.length === cars.length && cars.length > 0;

  function toggleSelectAll(checked?: boolean) {
    if (checked) setSelected(cars.map((c) => c.id));
    else setSelected([]);
  }

  const formatPrice = (n: number) => `AED ${n.toLocaleString()}`;
  const margin = (b: number, s?: number) => (s ? s - b : null);
  const roi = (b: number, s?: number) =>
    s ? (((s - b) / b) * 100).toFixed(1) : null;

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) => toggleSelectAll(!!v)}
              />
            </TableHead>
            <TableHead>Photo</TableHead>
            <TableHead>Stock / VIN</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Buy</TableHead>
            <TableHead>Sell</TableHead>
            <TableHead>Margin</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {cars.map((car) => (
            <TableRow key={car.id} className="hover:bg-muted/50">
              <TableCell>
                <Checkbox
                  checked={selected.includes(car.id)}
                  onCheckedChange={(v) => {
                    if (v) setSelected([...selected, car.id]);
                    else setSelected(selected.filter((x) => x !== car.id));
                  }}
                />
              </TableCell>

              <TableCell>
                {/* // eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    car.imgUrl ||
                    "/placeholder.svg?height=64&width=96&query=car"
                  }
                  alt={`${car.make} ${car.model}`}
                  className="w-24 h-16 object-cover rounded"
                />
              </TableCell>

              <TableCell className="font-mono text-sm">
                {car.stockId || car.vin}
              </TableCell>

              <TableCell>
                <div className="font-medium">
                  {car.make} {car.model}
                </div>
                <div className="text-sm text-muted-foreground">{car.year}</div>
              </TableCell>

              <TableCell>
                <Badge
                  variant={car.status === "available" ? "default" : "secondary"}
                >
                  {car.status === "available" ? "Available" : "Sold"}
                </Badge>
              </TableCell>

              <TableCell>{formatPrice(car.buyPrice)}</TableCell>
              <TableCell>
                {car.sellPrice ? formatPrice(car.sellPrice) : "-"}
              </TableCell>

              <TableCell>
                {car.sellPrice ? (
                  <div>
                    <div>{`AED ${margin(
                      car.buyPrice,
                      car.sellPrice
                    )!.toLocaleString()}`}</div>
                    <div className="text-sm text-muted-foreground">
                      {roi(car.buyPrice, car.sellPrice)}%
                    </div>
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {car.dateAdded}
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(car)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {car.status === "available" && (
                      <DropdownMenuItem onClick={() => onMarkAsSold(car.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Sold
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(car.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
