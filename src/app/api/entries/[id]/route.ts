// src/app/api/entries/[id]/route.ts
import { PrismaClient } from "../../../../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextResponse } from "next/server";

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
// Update entry
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { amount, type, description, relatedCarId, date } = await req.json();

    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });

    const updated = await prisma.entry.update({
      where: { id },
      data: {
        amount,
        type,
        description,
        relatedCarId,
        date: new Date(date),
      },
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
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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
