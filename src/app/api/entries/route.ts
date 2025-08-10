import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

//Helper function to recalculate balance
// Initially we used to calculate balance using increment/decrement with expenses and income
// However, that is somewhat riskier, for example if an update takes place and fails halfway
// or there is a bug in calculation, the stored balance could drift away from the true balance
// we need to also take into consideration floating point math errors over time.
// Plus if any entries were inserted or removed directly in the DB, balance will be wrong.
// Hence, we recalculate it each time. It will take time to load but its bulletproof.

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

// Create Entry
export async function POST(req: Request) {
  try {
    const { accountId, amount, type, description, relatedCarId, date } =
      await req.json();

    const entry = await prisma.entry.create({
      data: {
        accountId,
        amount,
        type,
        description,
        relatedCarId,
        date: new Date(date),
      },
    });

    const balance = await recalcBalance(accountId);
    return NextResponse.json({ entry, balance });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to create entry." },
      { status: 500 }
    );
  }
}

// Get all entries

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    const entries = await prisma.entry.findMany({
      where: accountId ? { accountId } : undefined,
      orderBy: { date: "desc" },
    });
    return NextResponse.json(entries);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to get entries." },
      { status: 500 }
    );
  }
}
