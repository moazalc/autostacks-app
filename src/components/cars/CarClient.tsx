// path: components/cars/CarsClient.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import CarForm from "./CarForm";
import ConfirmDialog from "../ConfirmDialog";
import type { Car } from "./CarForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Image } from "@radix-ui/react-avatar";
import { Grid3X3, List, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import ExportButton from "../export-button";

export default function CarsClient({
  initialData,
  accountId,
}: {
  initialData?: { items: Car[]; total?: number };
  accountId?: string;
}) {
  const [items, setItems] = useState<Car[]>(initialData?.items ?? []);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"table" | "grid">("table");

  // form state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Car | null>(null);

  // confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState<{
    id: string;
    action: "delete" | "markSold";
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    setItems(initialData?.items ?? []);
  }, [initialData]);

  async function loadList() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (accountId) params.set("accountId", accountId);
      const res = await fetch(`/api/cars?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to load cars");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    await loadList();
  }

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(car: Car) {
    setEditing(car);
    setFormOpen(true);
  }

  function openConfirm(id: string | undefined, action: "delete" | "markSold") {
    if (!id) {
      toast.error("Missing car id");
      return;
    }
    setConfirmPayload({ id, action });
    setConfirmOpen(true);
  }

  async function runConfirm() {
    if (!confirmPayload) return;
    setConfirmLoading(true);
    try {
      if (confirmPayload.action === "delete") {
        const res = await fetch(`/api/cars/${confirmPayload.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("Deleted");
      } else {
        const res = await fetch(`/api/cars/${confirmPayload.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "sold" }),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("Marked as sold");
      }
      setConfirmOpen(false);
      setConfirmPayload(null);
      await refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Action failed");
    } finally {
      setConfirmLoading(false);
    }
  }

  // helpers
  const StatusBadge = ({ status }: { status?: string | null }) => {
    const s = status ?? "available";
    const base = "inline-block px-2 py-0.5 rounded text-xs font-medium";
    if (s === "sold")
      return <span className={`${base} bg-red-100 text-red-800`}>Sold</span>;
    if (s === "pending")
      return (
        <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>
      );
    return (
      <span className={`${base} bg-green-100 text-green-800`}>Available</span>
    );
  };

  const ImgThumb = ({ src }: { src?: string | null }) => {
    if (!src)
      return (
        <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-muted-foreground">
          No image
        </div>
      );
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="thumb" className="w-20 h-12 object-cover rounded" />
    );
  };

  async function handleSaved(_car?: Car) {
    // called after CarForm success
    setFormOpen(false);
    setEditing(null);
    toast.success("Saved");
    await refresh();
  }

  return (
    <div>
      {/* Top controls */}
      <div className="flex items-end justify-between mb-4 gap-2">
        <div className="ml-4">
          <h1 className="text-3xl font-semibold">Cars</h1>
          <p className="text-sm text-muted-foreground ml-1">
            {items.length} items
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <ExportButton />
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Car
          </Button>

          <div className="flex border rounded-lg">
            <Button
              variant={view === "table" ? "default" : "ghost"}
              onClick={() => setView("table")}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              onClick={() => setView("grid")}
              className="rounded-l-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table view  */}
      {view === "table" && (
        <div className="overflow-auto border rounded">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>Thumb</TableHead>
                <TableHead>Make / Model</TableHead>
                <TableHead>Year / VIN</TableHead>
                <TableHead>Buy / Sell</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1, 2, 3].map((n) => (
                  <TableRow key={`skeleton-${n}`}>
                    <TableCell>
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-6" />
                    </TableCell>
                    <TableCell>
                      <div className="h-12 w-20 bg-gray-100 animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-32" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-20" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-24" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-16" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length > 0 ? (
                items.map((c, i) => (
                  <TableRow key={c.id ?? `row-${i}`}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <ImgThumb src={c.imgUrl} />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{c.make ?? "-"}</div>
                      <div className="text-sm text-muted-foreground">
                        {c.model ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{c.year ?? "-"}</div>
                      <div className="text-sm text-muted-foreground">
                        {c.vin ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{c.buyPrice ?? "-"}</div>
                      <div className="text-sm text-muted-foreground">
                        {c.price ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(c)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openConfirm(c.id, "markSold")}
                          disabled={c.status === "sold"}
                        >
                          Mark sold
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openConfirm(c.id, "delete")}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="p-4 text-center text-sm text-muted-foreground"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <Plus className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold">No cars found</h3>
                    <p>Add your first car to get started</p>
                    <Button
                      onClick={openAdd}
                      variant="ghost"
                      className="mt-2 border border-gray-300"
                    >
                      Add Car
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Grid view (cards) */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? [1, 2, 3].map((n) => (
                <div key={`g-skel-${n}`} className="border rounded p-3">
                  <div className="h-24 bg-gray-100 animate-pulse rounded" />
                </div>
              ))
            : items.map((c) => (
                <div
                  key={c.id ?? `card-${c.vin ?? Math.random()}`}
                  className="border rounded p-3"
                >
                  <div className="flex gap-3">
                    <ImgThumb src={c.imgUrl} />
                    <div className="flex-1">
                      <div className="font-medium">
                        {c.make} {c.model}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {c.year ?? "-"} • {c.vin ?? "-"}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <StatusBadge status={c.status} />
                        <div className="text-sm text-muted-foreground">
                          {c.price ?? "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(c)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openConfirm(c.id, "markSold")}
                      disabled={c.status === "sold"}
                    >
                      Mark sold
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openConfirm(c.id, "delete")}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
        </div>
      )}

      {/* Car form modal (shadcn Dialog) */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="w-full max-w-3xl p-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-lg font-medium">
                {editing ? "Edit Car" : "Add Car"}
              </DialogTitle>
              {/* <Button
                variant="ghost"
                onClick={() => {
                  setFormOpen(false);
                  setEditing(null);
                }}
              >
                <X />
              </Button> */}
            </div>

            <CarForm
              initial={editing}
              accountId={accountId}
              onSaved={handleSaved}
              onCancel={() => {
                setFormOpen(false);
                setEditing(null);
              }}
            />
          </div>
          <DialogFooter />
        </DialogContent>
      </Dialog>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        loading={confirmLoading}
        title={
          confirmPayload?.action === "delete" ? "Delete car?" : "Mark as sold?"
        }
        description={
          confirmPayload?.action === "delete"
            ? "This will permanently remove the car."
            : "This will mark the car as sold."
        }
        onConfirm={runConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmPayload(null);
        }}
        confirmLabel={
          confirmPayload?.action === "delete" ? "Delete" : "Mark sold"
        }
      />
    </div>
  );
}
