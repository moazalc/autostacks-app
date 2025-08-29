/* eslint-disable @typescript-eslint/no-explicit-any */
// path: components/entries/EntriesClient.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EntryForm, { Entry } from "./TransactionsForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Grid3X3, List, Plus } from "lucide-react";
import ExportButton from "../export-button";
import BalanceWidget from "@/components/BalanceWidget";

export default function EntriesClient({
  initialData,
  accountId,
}: {
  initialData?: { items: Entry[]; total?: number };
  accountId?: string;
}) {
  const [items, setItems] = useState<Entry[]>(initialData?.items ?? []);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"table" | "ledger">("table");

  // balance refresh key (increment to tell BalanceWidget to refetch)
  const [balanceRefreshKey, setBalanceRefreshKey] = useState(0);

  // dialog/form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);

  // confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState<{
    id: string;
    action: "delete";
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // helper to safely format a possibly-null/undefined balance
  const formatBalance = (b?: number | null) =>
    typeof b === "number" ? b.toFixed(2) : "-";

  // small date formatter helper
  const formatDate = (d?: string | Date | null) => {
    if (!d) return "-";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString();
  };

  // Helper: quick UUID check
  const isUuid = (s?: string | null) =>
    typeof s === "string" &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      s
    );

  // Load list once on mount (or when accountId prop changes)
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      try {
        if (initialData?.items) setItems(initialData.items);

        const params = new URLSearchParams();
        if (accountId) params.set("accountId", accountId);

        const res = await fetch(`/api/entries?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to fetch entries");
        }

        if (cancelled) return;
        const data = await res.json();
        const itemsFromApi = Array.isArray(data) ? data : data.items ?? [];
        if (!cancelled) setItems(itemsFromApi);
      } catch (err: any) {
        if (!cancelled) {
          console.error(err);
          if (err.name !== "AbortError") toast.error(err?.message ?? "Failed to load entries");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  // UI actions
  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(e: Entry) {
    setEditing(e);
    setDialogOpen(true);
  }

  function openConfirm(id?: string, action: "delete" = "delete") {
    if (!id) {
      toast.error("Missing entry id");
      return;
    }
    setConfirmPayload({ id, action });
    setConfirmOpen(true);
  }

  // Confirm dialog action: delete (UI + API)
  async function runConfirm() {
    if (!confirmPayload) return;
    setConfirmLoading(true);
    try {
      const { id } = confirmPayload;
      if (isUuid(id)) {
        const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Delete failed");
        }
        // server returns { message, balance } — we just remove locally
      }
      setItems((prev) => prev.filter((it) => it.id !== id));
      toast.success("Entry deleted");
      // refresh balance widget
      setBalanceRefreshKey((v) => v + 1);
      setConfirmOpen(false);
      setConfirmPayload(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Action failed");
    } finally {
      setConfirmLoading(false);
    }
  }

  // Main save handler: POST for new entries; PUT for updates (only if id is uuid)
   // Main save handler: POST for new entries; PUT for updates (only if id is uuid)
  async function handleSave(entry: Entry) {
    const normalizeOptionalId = (v: unknown) => {
      if (v === null || v === undefined) return undefined;
      if (typeof v === "string") {
        const s = v.trim();
        if (s === "" || s === "0") return undefined;
        return s;
      }
      return undefined;
    };

    try {
      const resolvedAccountId = (entry as any).accountId ?? accountId ?? (items[0] as any)?.accountId;
      if (!resolvedAccountId || typeof resolvedAccountId !== "string") {
        toast.error("Missing accountId — cannot save entry.");
        return;
      }

      const payload: any = {
        accountId: resolvedAccountId,
        amount: Number(entry.amount),
        type: entry.type,
        description: entry.description ? String(entry.description) : undefined,
        relatedCarId: normalizeOptionalId((entry as any).related),
        reference: normalizeOptionalId((entry as any).reference),
        date: entry.date,
      };

      const shouldUpdate = Boolean(entry.id) && isUuid(entry.id as string);
      const url = shouldUpdate ? `/api/entries/${entry.id}` : `/api/entries`;
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

      // saved on server — now refresh authoritative list from server
      const params = new URLSearchParams();
      if (resolvedAccountId) params.set("accountId", resolvedAccountId);

      const listRes = await fetch(`/api/entries?${params.toString()}`, {
        cache: "no-store",
      });

      if (!listRes.ok) {
        // if list refresh fails, still keep local optimistic update
        const text = await listRes.text();
        console.warn("Failed to refresh entries after save:", text);
      } else {
        const data = await listRes.json();
        const itemsFromApi = Array.isArray(data) ? data : data.items ?? [];
        setItems(itemsFromApi);
      }

      setDialogOpen(false);
      setEditing(null);
      toast.success("Saved");

      // refresh balance widget after save
      setBalanceRefreshKey((v) => v + 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to save entry");
      throw err;
    }
  }


  const TypeBadge = ({ t }: { t: Entry["type"] }) => {
    if (t === "CREDIT")
      return (
        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          Credit
        </span>
      );
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
        Debit
      </span>
    );
  };

  return (
    <div>
      {/* Top controls */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Entries</h2>
          <div className="text-sm text-muted-foreground">{items.length} items</div>
        </div>

        <div className="flex items-center gap-3">
          {/* Balance widget (reactive) */}
          <BalanceWidget accountId={accountId} refresh={balanceRefreshKey} />

          <ExportButton />
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Entry
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
              variant={view === "ledger" ? "default" : "ghost"}
              onClick={() => setView("ledger")}
              className="rounded-l-none"
            >
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
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Related</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

          <TableBody>
  {loading ? (
    [1, 2, 3].map((n) => (
      <TableRow key={`skel-${n}`}>
        <TableCell>
          <div className="h-4 bg-gray-100 animate-pulse rounded w-6" />
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-100 animate-pulse rounded w-24" />
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-100 animate-pulse rounded w-40" />
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-100 animate-pulse rounded w-16" />
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-100 animate-pulse rounded w-20 ml-auto" />
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-100 animate-pulse rounded w-20 ml-auto" />
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-100 animate-pulse rounded w-16" />
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-100 animate-pulse rounded w-20" />
        </TableCell>
        <TableCell>
          <div className="h-4 bg-gray-100 animate-pulse rounded w-24 ml-auto" />
        </TableCell>
      </TableRow>
    ))
  ) : items.length > 0 ? (
    (() => {
      // Compute "balance at that moment" (history) from oldest -> newest.
      // Start from initial balance 0. If you need a different starting balance,
      // replace `initialBalance` with the value from the server.
      const initialBalance = 0;
      // create an array sorted oldest-first by date
      const sorted = [...items].slice().sort((a, b) => {
        const da = new Date((a as any).date).getTime();
        const db = new Date((b as any).date).getTime();
        return da - db;
      });

      // build a Map using object references (entries are same objects) -> balanceAfter
      const balanceMap = new Map<any, number>();
      let running = initialBalance;
      for (const it of sorted) {
        const amt = Number((it as any).amount) || 0;
        const signed = (it as any).type === "CREDIT" ? amt : -amt;
        running += signed;
        balanceMap.set(it, running);
      }

      // Render rows in the original items order (whatever the UI currently uses)
      return items.map((e, i) => {
        const balanceAtMoment = balanceMap.has(e) ? balanceMap.get(e)! : undefined;
        return (
          <TableRow key={(e as any).id ?? `row-${i}`}>
            <TableCell>{i + 1}</TableCell>
            <TableCell>{formatDate((e as any).date)}</TableCell>
            <TableCell>
              <div className="font-medium">{(e as any).description}</div>
            </TableCell>
            <TableCell>
              <TypeBadge t={(e as any).type} />
            </TableCell>
            <TableCell className="text-right">
              {Number((e as any).amount).toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              {typeof balanceAtMoment === "number" ? Number(balanceAtMoment).toFixed(2) : "-"}
            </TableCell>
            <TableCell>{(e as any).related ?? "-"}</TableCell>
            <TableCell>{(e as any).reference ?? "-"}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => openEdit(e)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => openConfirm((e as any).id)}>
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        );
      });
    })()
  ) : (
    <TableRow>
      <TableCell colSpan={9} className="p-6 text-center text-muted-foreground">
        <div className="mb-4">
          <Plus className="mx-auto h-10 w-10 bg-muted rounded-full p-2" />
        </div>
        <div className="text-lg font-semibold">No entries yet</div>
        <div className="text-sm text-muted-foreground">Add entries using the button above.</div>
        <div className="mt-4">
          <Button onClick={openAdd} variant="ghost">
            Add Entry
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )}
</TableBody>


          </Table>
        </div>
      )}

      {/* Ledger view */}
      {view === "ledger" && (
        <div className="space-y-3">
          {items.length > 0 ? (
            items.map((e) => (
              <div key={e.id ?? Math.random()} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {formatDate(e.date)} • <TypeBadge t={e.type} />
                  </div>
                  <div className="text-sm text-muted-foreground">{e.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Related: {(e as any).related ?? "-"} • Ref: {(e as any).reference ?? "-"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{Number(e.amount).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{formatBalance((e as any).balance)}</div>
                  <div className="mt-2 flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(e)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => openConfirm(e.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground">No entries to show</div>
          )}
        </div>
      )}

      {/* Entry Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="w-full max-w-2xl">
          <div className="p-4">
            <DialogTitle className="mb-5">{editing ? "Edit Entry" : "Add Entry"}</DialogTitle>
            <EntryForm
              initial={editing}
              onSaved={(e) => handleSave(e)}
              onCancel={() => {
                setDialogOpen(false);
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
        title="Delete entry?"
        description="This will permanently remove the entry."
        onConfirm={runConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmPayload(null);
        }}
        confirmLabel="Delete"
      />
    </div>
  );
}
