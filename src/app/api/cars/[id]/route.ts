import { PrismaClient } from "../../../../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextResponse } from "next/server";

const prisma = new PrismaClient().$extends(withAccelerate());

// Get a single car using ID
export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) {
      return NextResponse.json({ error: "Car not found!" }, { status: 404 });
    }
    return NextResponse.json(car);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error fetching car" },
      { status: 500 }
    );
  }
}

// Update a car
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const {
    make,
    model,
    year,
    buyPrice,
    buyDate,
    imgUrl,
    sellPrice,
    sellDate,
    notes,
  } = await req.json();

  try {
    const updated = await prisma.car.update({
      where: { id },
      data: {
        make,
        model,
        year: year ? Number(year) : undefined,
        buyPrice,
        buyDate: buyDate ? new Date(buyDate) : undefined,
        imgUrl,
        sellPrice,
        sellDate: sellDate ? new Date(sellDate) : undefined,
        notes,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error updating car" }, { status: 500 });
  }
}

// Delete a car
export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await prisma.car.delete({ where: { id } });
    return NextResponse.json({ message: "Car deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error deleting car" }, { status: 500 });
  }
}
