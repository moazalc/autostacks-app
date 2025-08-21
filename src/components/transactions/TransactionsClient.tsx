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

export default function EntriesClient({
  initialData,
}: {
  initialData?: { items: Entry[]; total?: number };
}) {
  const [items, setItems] = useState<Entry[]>(initialData?.items ?? []);
  const [loading] = useState(false); // UI-only
  const [view, setView] = useState<"table" | "ledger">("table");

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

  useEffect(() => {
    setItems(initialData?.items ?? []);
  }, [initialData]);

  // local-only behaviors
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

  function runConfirm() {
    if (!confirmPayload) return;
    setConfirmLoading(true);
    try {
      if (confirmPayload.action === "delete") {
        setItems((prev) => prev.filter((it) => it.id !== confirmPayload.id));
        toast.success("Entry deleted");
      }
      setConfirmOpen(false);
      setConfirmPayload(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Action failed");
    } finally {
      setConfirmLoading(false);
    }
  }

  function handleSave(entry: Entry) {
    setItems((prev) => {
      const exists = prev.find((p) => p.id === entry.id);
      if (exists) {
        return prev.map((p) => (p.id === entry.id ? { ...p, ...entry } : p));
      }
      return [entry, ...prev];
    });
    setDialogOpen(false);
    setEditing(null);
    toast.success("Saved");
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
          <div className="text-sm text-muted-foreground">
            {items.length} items
          </div>
        </div>

        <div className="flex items-center gap-2">
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
                items.map((e, i) => (
                  <TableRow key={e.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{e.date}</TableCell>
                    <TableCell>
                      <div className="font-medium">{e.description}</div>
                    </TableCell>
                    <TableCell>
                      <TypeBadge t={e.type} />
                    </TableCell>
                    <TableCell className="text-right">
                      {e.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatBalance(e.balance)}
                    </TableCell>
                    <TableCell>{e.related ?? "-"}</TableCell>
                    <TableCell>{e.reference ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(e)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openConfirm(e.id)}
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
                    colSpan={9}
                    className="p-6 text-center text-muted-foreground"
                  >
                    <div className="mb-4">
                      <Plus className="mx-auto h-10 w-10 bg-muted rounded-full p-2" />
                    </div>
                    <div className="text-lg font-semibold">No entries yet</div>
                    <div className="text-sm text-muted-foreground">
                      Add entries using the button above.
                    </div>
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
              <div
                key={e.id}
                className="border rounded p-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium">
                    {e.date} • <TypeBadge t={e.type} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {e.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Related: {e.related ?? "-"} • Ref: {e.reference ?? "-"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{e.amount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatBalance(e.balance)}
                  </div>
                  <div className="mt-2 flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(e)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openConfirm(e.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground">
              No entries to show
            </div>
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
            <DialogTitle className="mb-5">
              {editing ? "Edit Entry" : "Add Entry"}
            </DialogTitle>
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
