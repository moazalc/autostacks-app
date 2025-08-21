/* eslint-disable @typescript-eslint/no-explicit-any */
// path: components/entries/EntryForm.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Image from "next/image";

export type Entry = {
  id?: string;
  date: string; // ISO 'YYYY-MM-DD'
  description: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  balance?: number | null;
  related?: string | null; // e.g. VIN or reference to car
  reference?: string | null;
  attachmentDataUrl?: string | null; // optional data-URL for preview (client-only)
};

export default function EntryForm({
  initial = null,
  onSaved,
  onCancel,
}: {
  initial?: Entry | null;
  onSaved?: (entry: Entry) => void | Promise<void>;
  onCancel?: () => void;
}) {
  const [date, setDate] = useState<string>(
    initial?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState<string>(
    initial?.description ?? ""
  );
  const [type, setType] = useState<Entry["type"]>(initial?.type ?? "DEBIT");
  const [amount, setAmount] = useState<string>(
    initial?.amount !== undefined ? String(initial.amount) : ""
  );
  const [related, setRelated] = useState<string>(initial?.related ?? "");
  const [reference, setReference] = useState<string>(initial?.reference ?? "");
  const [attachmentDataUrl, setAttachmentDataUrl] = useState<string | null>(
    initial?.attachmentDataUrl ?? null
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // reset when initial changes
    setDate(initial?.date ?? new Date().toISOString().slice(0, 10));
    setDescription(initial?.description ?? "");
    setType(initial?.type ?? "DEBIT");
    setAmount(initial?.amount !== undefined ? String(initial.amount) : "");
    setRelated(initial?.related ?? "");
    setReference(initial?.reference ?? "");
    setAttachmentDataUrl(initial?.attachmentDataUrl ?? null);
  }, [initial]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    // small client-side size guard (5MB)
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Attachment too large (max 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentDataUrl(String(reader.result));
    };
    reader.readAsDataURL(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // basic validation
    const amt = Number(amount || 0);
    if (!date) {
      toast.error("Please pick a date");
      return;
    }
    if (!description.trim()) {
      toast.error("Please add a description");
      return;
    }
    if (!amt || Number.isNaN(amt)) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSaving(true);
    try {
      const entry: Entry = {
        id: initial?.id ?? `entry-${Date.now()}`,
        date,
        description: description.trim(),
        type,
        amount: amt,
        balance: initial?.balance ?? null,
        related: related ? related.trim() : null,
        reference: reference ? reference.trim() : null,
        attachmentDataUrl: attachmentDataUrl ?? null,
      };

      // call callback (parent handles persistence or local state)
      await Promise.resolve(onSaved?.(entry));
      toast.success("Saved");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="mb-1">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <Label className="mb-1">Type</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as Entry["type"])}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DEBIT">Debit</SelectItem>
              <SelectItem value="CREDIT">Credit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-1">Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Payment for repairs, sale, fee..."
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="mb-1">Amount</Label>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="1234.56"
          />
        </div>

        <div>
          <Label className="mb-1">Related (VIN / ref)</Label>
          <Input
            value={related}
            onChange={(e) => setRelated(e.target.value)}
            placeholder="VIN or related item"
          />
        </div>
      </div>

      <div>
        <Label className="mb-1">Reference</Label>
        <Input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Tx id / bank ref"
        />
      </div>

      <div>
        <Label className="mb-1">Attachment</Label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*,application/pdf"
            onChange={onFile}
          />
          <Button
            variant="ghost"
            type="button"
            onClick={() => setAttachmentDataUrl(null)}
          >
            Clear
          </Button>
        </div>
        {attachmentDataUrl && (
          <div className="mt-2">
            {/* small preview for images; for PDFs just show filename/preview not implemented */}
            {attachmentDataUrl.startsWith("data:image") ? (
              <Image
                src={attachmentDataUrl}
                alt="attachment preview"
                className="w-48 h-32 object-cover rounded-md"
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                Attachment ready
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : initial?.id ? "Save" : "Create"}
        </Button>
      </div>
    </form>
  );
}
