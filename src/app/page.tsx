import { getServerSession } from "next-auth";
import { AuthButtons } from "@/components/AuthButtons";
import { authOptions } from "@/lib/auth";
import { TicketPageContent } from "@/components/TicketPageContent";
import { connectToDatabase } from "@/lib/mongodb";
import { TicketModel } from "@/models/Ticket";
import type { Ticket } from "@/types/ticket";

async function getTickets(ownerEmail: string): Promise<Ticket[]> {
  await connectToDatabase();
  const raw = await TicketModel.find({ ownerEmail }).sort({ sortOrder: 1, updatedAt: -1 }).lean();
  const tickets = JSON.parse(JSON.stringify(raw)) as Ticket[];
  return tickets.map((t) => ({
    ...t,
    sortOrder: t.sortOrder ?? new Date(t.updatedAt).getTime(),
    labels: t.labels ?? [],
    checklist: t.checklist ?? [],
    branches: t.branches ?? [],
    statusHistory: t.statusHistory ?? []
  }));
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

  let tickets: Ticket[] = [];
  let dbError: string | null = null;
  try {
    tickets = await getTickets(ownerEmail);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    dbError =
      message.includes("MONGODB_URI") || message.includes("ECONNREFUSED") || message.includes("ENOTFOUND")
        ? "No se pudo conectar a la base de datos. Revisa MONGODB_URI en Vercel y en MongoDB Atlas: Network Access debe permitir 0.0.0.0/0 (o IPs de Vercel) para entornos serverless."
        : `No se pudieron cargar los tickets: ${message}`;
  }

  if (dbError) {
    return (
      <section className="space-y-6">
        <header className="surface space-y-4 p-6">
          <p className="muted uppercase tracking-[0.2em]">Workspace</p>
          <h1 className="heading-xl">Gestor de tickets</h1>
          <p className="text-sm text-rose-300">{dbError}</p>
          <div className="flex flex-wrap gap-3">
            <AuthButtons />
          </div>
        </header>
      </section>
    );
  }

  return <TicketPageContent tickets={tickets} authSlot={<AuthButtons />} />;
}
