import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { TicketModel } from "@/models/Ticket";
import { MAIN_STATUS, type MainStatus } from "@/types/ticket";

type Params = {
  params: { id: string };
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    const ownerEmail = session?.user?.email;
    if (!ownerEmail) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const to = body.mainStatus as MainStatus | undefined;
    const sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : undefined;

    if (to && !MAIN_STATUS.includes(to)) {
      return NextResponse.json({ message: "Estado invalido" }, { status: 400 });
    }

    if (!to && sortOrder === undefined) {
      return NextResponse.json({ message: "Nada que actualizar" }, { status: 400 });
    }

    const current = await TicketModel.findOne({ _id: params.id, ownerEmail }).lean();
    if (!current) {
      return NextResponse.json({ message: "Ticket no encontrado" }, { status: 404 });
    }

    const updatePayload: Record<string, unknown> = {};

    if (to) {
      const statusChanged = to !== current.mainStatus;
      if (statusChanged) {
        updatePayload.mainStatus = to;
        updatePayload.$push = {
          statusHistory: {
            from: current.mainStatus,
            to,
            date: new Date()
          }
        };
      }
    }

    if (sortOrder !== undefined) {
      updatePayload.sortOrder = sortOrder;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(current);
    }

    const updated = await TicketModel.findOneAndUpdate({ _id: params.id, ownerEmail }, updatePayload, {
      new: true
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "No se pudo actualizar el ticket", error }, { status: 500 });
  }
}
