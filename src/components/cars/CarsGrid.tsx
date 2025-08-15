// components/cars/CarsGrid.tsx
"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, CheckCircle } from "lucide-react";
import type { Car } from "./types";

export default function CarsGrid({
  cars,
  onEdit,
  onMarkAsSold,
}: {
  cars: Car[];
  onEdit: (c: Car) => void;
  onMarkAsSold: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => (
        <Card key={car.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
               {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  car.imgUrl ||
                  "/placeholder.svg?height=120&width=160&query=car"
                }
                alt={`${car.make} ${car.model}`}
                className="w-40 h-32 object-cover"
              />
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">
                      {car.make} {car.model} ({car.year})
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      {car.stockId || car.vin}
                    </p>
                  </div>
                  <Badge
                    variant={
                      car.status === "available" ? "default" : "secondary"
                    }
                  >
                    {car.status === "available" ? "Available" : "Sold"}
                  </Badge>
                </div>

                <div className="text-sm space-y-1 mb-3">
                  <div>Buy: AED {car.buyPrice.toLocaleString()}</div>
                  {car.sellPrice && (
                    <div>Sell: AED {car.sellPrice.toLocaleString()}</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(car)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {car.status === "available" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMarkAsSold(car.id)}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
