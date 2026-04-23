import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TicketModel } from "@/models/Ticket";
import type { MainStatus } from "@/types/ticket";

type Params = {
  params: { id: string };
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const to = body.mainStatus as MainStatus;

    const current = await TicketModel.findById(params.id).lean();
    if (!current) {
      return NextResponse.json({ message: "Ticket no encontrado" }, { status: 404 });
    }

    if (!to || to === current.mainStatus) {
      return NextResponse.json(current);
    }

    const updated = await TicketModel.findByIdAndUpdate(
      params.id,
      {
        mainStatus: to,
        $push: {
          statusHistory: {
            from: current.mainStatus,
            to,
            date: new Date()
          }
        }
      },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "No se pudo actualizar el estado", error }, { status: 500 });
  }
}
