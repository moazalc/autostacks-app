import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { entryCreateSchema } from "@/lib/validation";
import { z } from "zod";

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

// ✅ Keep your original behavior: accountId is optional in GET,
// but validate it if provided.
const listQuerySchema = z.object({
  accountId: z.uuid().optional(),
});

// Create Entry
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = entryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const entry = await prisma.entry.create({
      data: {
        accountId: data.accountId,
        amount: data.amount,
        type: data.type,
        description: data.description,
        relatedCarId: data.relatedCarId,
        date: data.date,
      },
    });

    const balance = await recalcBalance(data.accountId);
    return NextResponse.json({ entry, balance }, { status: 201 });
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

    const parsed = listQuerySchema.safeParse({
      accountId: searchParams.get("accountId") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const accountId = parsed.data.accountId;

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
