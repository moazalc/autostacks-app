// components/cars/AddCarDialog.tsx
"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CarForm from "./CarForm";
import type { Car } from "./types";

export default function AddCarDialog({
  open,
  onClose,
  initial,
  onCreated,
}: {
  open?: boolean;
  onClose?: () => void;
  initial?: Car | null;
  onCreated?: (car: Partial<Car>) => void;
}) {
  // This component can be used both as in-page dialog or as the inner form in a DialogContent
  // If you want to use it with <DialogTrigger>, you can render <CarForm> inside DialogContent.
  // Here we simply render the form (wrapping with Dialog if `open` is provided).
  const inner = (
    <div className="p-4">
      <CarForm
        car={initial ?? null}
        onSave={(data) => {
          onCreated?.(data);
          onClose?.();
        }}
        onCancel={() => onClose?.()}
      />
    </div>
  );

  if (typeof open === "boolean") {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{initial ? "Edit Car" : "Add New Car"}</DialogTitle>
          </DialogHeader>
          {inner}
        </DialogContent>
      </Dialog>
    );
  }

  // fallback: return the form alone (useful for embedding in DialogContent)
  return inner;
}
