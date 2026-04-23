import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { DEFAULT_CHECKLIST } from "@/lib/ticket-logic";
import { TicketModel } from "@/models/Ticket";
import { TICKET_LABELS, type MainStatus, type TicketLabel } from "@/types/ticket";

function sanitizeLabels(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const allowed = new Set(TICKET_LABELS);
  return [
    ...new Set(
      input.filter((label): label is TicketLabel => typeof label === "string" && allowed.has(label as TicketLabel))
    )
  ];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const ownerEmail = session?.user?.email;
    if (!ownerEmail) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    await connectToDatabase();
    const tickets = await TicketModel.find({ ownerEmail }).sort({ updatedAt: -1 }).lean();
    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ message: "No se pudieron obtener tickets", error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const ownerEmail = session?.user?.email;
    if (!ownerEmail) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const mainStatus = (body.mainStatus ?? "TODO") as MainStatus;
    const now = new Date();

    const ticket = await TicketModel.create({
      ownerEmail,
      title: body.title,
      description: body.description ?? "",
      mainStatus,
      labels: sanitizeLabels(body.labels),
      checklist: Array.isArray(body.checklist) && body.checklist.length > 0 ? body.checklist : DEFAULT_CHECKLIST,
      branches: Array.isArray(body.branches) ? body.branches : [],
      statusHistory: [{ from: null, to: mainStatus, date: now }]
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "No se pudo crear el ticket", error }, { status: 500 });
  }
}
