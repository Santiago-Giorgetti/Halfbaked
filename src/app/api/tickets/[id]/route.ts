import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { TicketModel } from "@/models/Ticket";
import { TICKET_LABELS, type TicketLabel } from "@/types/ticket";

function sanitizeLabels(input: unknown, fallback: string[]): string[] {
  if (!Array.isArray(input)) return fallback;
  const allowed = new Set(TICKET_LABELS);
  return [
    ...new Set(
      input.filter((label): label is TicketLabel => typeof label === "string" && allowed.has(label as TicketLabel))
    )
  ];
}

type Params = {
  params: { id: string };
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    const ownerEmail = session?.user?.email;
    if (!ownerEmail) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    await connectToDatabase();
    const ticket = await TicketModel.findOne({ _id: params.id, ownerEmail }).lean();
    if (!ticket) {
      return NextResponse.json({ message: "Ticket no encontrado" }, { status: 404 });
    }
    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ message: "No se pudo obtener el ticket", error }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    const ownerEmail = session?.user?.email;
    if (!ownerEmail) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const current = await TicketModel.findOne({ _id: params.id, ownerEmail }).lean();
    if (!current) {
      return NextResponse.json({ message: "Ticket no encontrado" }, { status: 404 });
    }

    const nextStatus = body.mainStatus ?? current.mainStatus;
    const statusChanged = nextStatus !== current.mainStatus;

    const updatePayload = {
      title: body.title ?? current.title,
      description: body.description ?? current.description,
      mainStatus: nextStatus,
      labels: sanitizeLabels(body.labels, current.labels),
      checklist: Array.isArray(body.checklist) ? body.checklist : current.checklist,
      branches: Array.isArray(body.branches) ? body.branches : current.branches
    };

    const updated = await TicketModel.findOneAndUpdate(
      { _id: params.id, ownerEmail },
      statusChanged
        ? {
            ...updatePayload,
            $push: {
              statusHistory: {
                from: current.mainStatus,
                to: nextStatus,
                date: new Date()
              }
            }
          }
        : updatePayload,
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "No se pudo actualizar el ticket", error }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    const ownerEmail = session?.user?.email;
    if (!ownerEmail) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    await connectToDatabase();
    const deleted = await TicketModel.findOneAndDelete({ _id: params.id, ownerEmail });
    if (!deleted) {
      return NextResponse.json({ message: "Ticket no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: "No se pudo eliminar el ticket", error }, { status: 500 });
  }
}
