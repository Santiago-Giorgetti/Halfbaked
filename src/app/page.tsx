import Link from "next/link";
import { getServerSession } from "next-auth";
import { AuthButtons } from "@/components/AuthButtons";
import { authOptions } from "@/lib/auth";
import { TicketCard } from "@/components/TicketCard";
import { connectToDatabase } from "@/lib/mongodb";
import { TicketModel } from "@/models/Ticket";
import type { Ticket } from "@/types/ticket";

async function getTickets(ownerEmail: string): Promise<Ticket[]> {
  await connectToDatabase();
  const tickets = await TicketModel.find({ ownerEmail }).sort({ updatedAt: -1 }).lean();
  return JSON.parse(JSON.stringify(tickets));
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const ownerEmail = session?.user?.email;

  if (!ownerEmail) {
    return (
      <section className="space-y-6">
        <header className="surface space-y-4 p-6">
          <p className="muted uppercase tracking-[0.2em]">Workspace</p>
          <h1 className="heading-xl">Gestor de tickets</h1>
          <p className="muted">Inicia sesion con Google para crear y ver tus tickets personales.</p>
          <AuthButtons />
        </header>
      </section>
    );
  }

  const tickets = await getTickets(ownerEmail);

  return (
    <section className="space-y-6">
      <header className="surface flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="muted uppercase tracking-[0.2em]">Workspace</p>
          <h1 className="heading-xl">Gestor de tickets</h1>
          <p className="muted">Seguimiento claro de tareas, estados y avance tecnico.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/tickets/new" className="btn btn-primary">
            Nuevo ticket
          </Link>
          <AuthButtons />
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {tickets.map((ticket) => (
          <TicketCard key={ticket._id} ticket={ticket} />
        ))}
        {tickets.length === 0 && (
          <div className="surface p-10 text-center">
            <p className="text-sm text-slate-300">No hay tickets todavia. Crea el primero para empezar.</p>
          </div>
        )}
      </div>
    </section>
  );
}
