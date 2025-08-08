import { PrismaClient } from "../../../../../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextResponse } from "next/server";

const prisma = new PrismaClient().$extends(withAccelerate());

// Get a single car using ID
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const car = await prisma.car.findUnique({ where: { id: params.id } });
    if (!car)
      return NextResponse.json({ error: "Car not found!" }, { status: 404 });
    return NextResponse.json(car);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Error fetching car" },
      { status: 500 }
    );
  }
}

// Update a car
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { make, model, year } = await req.json();

  try {
    const updated = await prisma.car.update({
      where: { id: params.id },
      data: { make, model, year: Number(year) },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Error updating car" }, { status: 500 });
  }
}

// Delete a car
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.car.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Car deleted" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Error deleting car" }, { status: 500 });
  }
}
