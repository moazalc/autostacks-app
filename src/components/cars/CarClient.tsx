// path: components/cars/CarClient.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import CarForm, { Car } from "./CarForm";
import ConfirmDialog from "../ConfirmDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Grid3X3, List, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "../ui/dialog";

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

  const isUuid = (s?: string | null) =>
    typeof s === "string" &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      s
    );

  // load list (server-backed)
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        // show initial snapshot
        if (initialData?.items) setItems(initialData.items);

        const params = new URLSearchParams();
        if (accountId) params.set("accountId", accountId);

        const res = await fetch(`/api/cars?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to fetch cars");
        }

        if (cancelled) return;
        const data = await res.json();
        const itemsFromApi = Array.isArray(data) ? data : data.items ?? [];
        if (!cancelled) setItems(itemsFromApi);
      } catch (err: any) {
        if (!cancelled) {
          console.error(err);
          if (err.name !== "AbortError") toast.error(err?.message ?? "Failed to load cars");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  async function refresh() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (accountId) params.set("accountId", accountId);
      const res = await fetch(`/api/cars?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const itemsFromApi = Array.isArray(data) ? data : data.items ?? [];
      setItems(itemsFromApi);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to refresh cars");
    } finally {
      setLoading(false);
    }
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
      const { id, action } = confirmPayload;
      if (action === "delete") {
        if (isUuid(id)) {
          const res = await fetch(`/api/cars/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error(await res.text());
        }
        toast.success("Deleted");
      } else {
        // mark sold
        if (isUuid(id)) {
          const res = await fetch(`/api/cars/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "sold" }),
          });
          if (!res.ok) throw new Error(await res.text());
        }
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

  // Main save handler: POST for new cars; PUT for updates (only if id is uuid)
  async function handleSave(car: Car) {
    try {
      // normalize image/url fields & optional values here if needed
      const payload: any = {
        accountId: (car as any).accountId ?? accountId,
        make: car.make,
        model: car.model,
        year: car.year,
        imgUrl: car.imgUrl ?? undefined,
        buyPrice: typeof car.buyPrice === "number" ? car.buyPrice : car.buyPrice ? Number(car.buyPrice) : undefined,
        buyDate: (car as any).buyDate ?? undefined,
        sellPrice: typeof car.sellPrice === "number" ? car.sellPrice : car.sellPrice ? Number(car.sellPrice) : undefined,
        sellDate: (car as any).sellDate ?? undefined,
        notes: (car as any).notes ?? undefined,
      };

      if (!payload.accountId) {
        toast.error("Missing accountId — cannot save car.");
        return;
      }

      const shouldUpdate = Boolean(car.id) && isUuid(car.id as string);
      const url = shouldUpdate ? `/api/cars/${car.id}` : `/api/cars`;
      const method = shouldUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Save failed");
      }

      // refresh authoritative list
      await refresh();

      setFormOpen(false);
      setEditing(null);
      toast.success(shouldUpdate ? "Updated" : "Created");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to save car");
    }
  }

  // helpers (UI)
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

  return (
    <div>
      {/* Top controls */}
      <div className="flex items-end justify-between mb-4 gap-2">
        <div className="ml-4">
          <h1 className="text-3xl font-semibold">Cars</h1>
          <p className="text-sm text-muted-foreground ml-1">{items.length} items</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button onClick={openAdd}>+ Add Car</Button>

          <div className="flex border rounded-lg">
            <Button variant={view === "table" ? "default" : "ghost"} onClick={() => setView("table")} className="rounded-r-none">
              <List className="h-4 w-4" />
            </Button>
            <Button variant={view === "grid" ? "default" : "ghost"} onClick={() => setView("grid")} className="rounded-l-none">
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table view */}
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
                      <div className="text-sm text-muted-foreground">{c.model ?? "-"}</div>
                    </TableCell>
                    <TableCell>
                      <div>{c.year ?? "-"}</div>
                      <div className="text-sm text-muted-foreground">{(c as any).vin ?? "-"}</div>
                    </TableCell>
                    <TableCell>
                      <div>{c.buyPrice ?? "-"}</div>
                      <div className="text-sm text-muted-foreground">{c.sellPrice ?? "-"}</div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {c.sellDate ? "Sold" : "Available"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openConfirm(c.id, "markSold")} disabled={c.sellDate != null}>
                          Mark sold
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => openConfirm(c.id, "delete")}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="p-4 text-center text-sm text-muted-foreground">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <Plus className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold">No cars found</h3>
                    <p>Add your first car to get started</p>
                    <Button onClick={openAdd} variant="ghost" className="mt-2 border border-gray-300">
                      Add Car
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? [1, 2, 3].map((n) => (
                <div key={`g-skel-${n}`} className="border rounded p-3">
                  <div className="h-24 bg-gray-100 animate-pulse rounded" />
                </div>
              ))
            : items.map((c) => (
                <div key={c.id ?? `card-${Math.random()}`} className="border rounded p-3">
                  <div className="flex gap-3">
                    <ImgThumb src={c.imgUrl} />
                    <div className="flex-1">
                      <div className="font-medium">{c.make} {c.model}</div>
                      <div className="text-sm text-muted-foreground">{c.year ?? "-"} • {(c as any).vin ?? "-"}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          {c.sellDate ? "Sold" : "Available"}
                        </span>
                        <div className="text-sm text-muted-foreground">{c.sellPrice ?? "-"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openConfirm(c.id, "markSold")} disabled={c.sellDate != null}>
                      Mark sold
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => openConfirm(c.id, "delete")}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
        </div>
      )}

      {/* Car form modal (dialog) */}
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
              <DialogTitle className="text-lg font-medium">{editing ? "Edit Car" : "Add Car"}</DialogTitle>
            </div>

            <CarForm
              initial={editing}
              accountId={accountId}
              onSaved={handleSave}
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
        title={confirmPayload?.action === "delete" ? "Delete car?" : "Mark as sold?"}
        description={confirmPayload?.action === "delete" ? "This will permanently remove the car." : "This will mark the car as sold."}
        onConfirm={runConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmPayload(null);
        }}
        confirmLabel={confirmPayload?.action === "delete" ? "Delete" : "Mark sold"}
      />
    </div>
  );
}
