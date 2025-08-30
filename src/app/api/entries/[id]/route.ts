// src/app/api/entries/[id]/route.ts
import { PrismaClient } from "../../../../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextResponse } from "next/server";

// ✅ use your shared schemas
import { entryUpdateSchema } from "@/lib/validation";
import { z } from "zod";

const prisma = new PrismaClient().$extends(withAccelerate());

async function recalcBalance(accountId: string) {
  const credit = await prisma.entry.aggregate({
    _sum: { amount: true },
    where: { accountId, type: "CREDIT" },
  });
  const debit = await prisma.entry.aggregate({
    _sum: { amount: true },
    where: { accountId, type: "DEBIT" },
  });

  const newBalance = (credit._sum?.amount ?? 0) - (debit._sum?.amount ?? 0);

  await prisma.balance.upsert({
    where: { accountId },
    create: { accountId, amount: newBalance },
    update: { amount: newBalance },
  });

  return newBalance;
}

// ✅ Validate dynamic route param
const idParamSchema = z.object({ id: z.uuid() });

// Update entry
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // ✅ Validate id
    const idParsed = idParamSchema.safeParse(await params);
    if (!idParsed.success) {
      return NextResponse.json(
        { error: "Invalid entry id", issues: idParsed.error.issues },
        { status: 400 }
      );
    }
    const { id } = idParsed.data;

    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });

    const body = await req.json();

    // ✅ Validate body using your schema
    const parsed = entryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // Optional safety: prevent changing accountId via update
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accountId: _ignoreAccountId, ...safeData } = parsed.data as Record<
      string,
      unknown
    >;

    const updated = await prisma.entry.update({
      where: { id },
      data: { ...safeData },
    });

    const balance = await recalcBalance(existing.accountId);

    return NextResponse.json({ updated, balance });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

// Delete entry
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const parsed = idParamSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid entry id", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const { id } = parsed.data;

    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });

    await prisma.entry.delete({ where: { id } });

    const balance = await recalcBalance(existing.accountId);

    return NextResponse.json({ message: "Entry deleted", balance });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
