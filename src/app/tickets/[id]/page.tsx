import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LabelBadge } from "@/components/LabelBadge";
import { isInconsistent, progress, progressFraction } from "@/lib/ticket-logic";
import { connectToDatabase } from "@/lib/mongodb";
import { TicketModel } from "@/models/Ticket";

type Props = {
  params: { id: string };
};

export default async function TicketDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const ownerEmail = session?.user?.email;
  if (!ownerEmail) notFound();

  await connectToDatabase();
  const ticket = await TicketModel.findOne({ _id: params.id, ownerEmail }).lean();
  if (!ticket) notFound();

  const inconsistent = isInconsistent(ticket.mainStatus, ticket.checklist);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="muted hover:text-slate-200">
          Volver al listado
        </Link>
        <Link href={`/tickets/${params.id}/edit`} className="btn btn-secondary">
          Editar
        </Link>
      </div>

      <article className="card space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">{ticket.title}</h1>
        <p className="leading-relaxed text-slate-300">{ticket.description || "Sin descripcion."}</p>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-3">
          <span className="badge bg-slate-800 text-slate-200">{ticket.mainStatus}</span>
          <span className="text-sm text-slate-300">
            Progreso: {progressFraction(ticket.checklist)} ({progress(ticket.checklist)}%)
          </span>
          {inconsistent && <span className="badge border-rose-800 bg-rose-900/30 text-rose-200">Inconsistente</span>}
        </div>

        <div className="flex flex-wrap gap-2">
          {ticket.labels.map((label: string) => (
            <LabelBadge key={label} value={label} />
          ))}
        </div>
      </article>

      <article className="card space-y-3">
        <h2 className="text-base font-medium text-slate-100">Checklist</h2>
        {ticket.checklist.map((item: { key: string; label: string; done: boolean }) => (
          <p key={item.key} className="text-sm text-slate-300">
            {item.done ? "✓" : "○"} {item.label}
          </p>
        ))}
      </article>

      <article className="card space-y-3">
        <h2 className="text-base font-medium text-slate-100">Historial de estados</h2>
        {ticket.statusHistory.map((entry: { from: string | null; to: string; date: string }, index: number) => (
          <p key={`${entry.to}-${index}`} className="text-sm text-slate-300">
            {entry.from ?? "INIT"} → {entry.to} ({new Date(entry.date).toLocaleString("es-ES")})
          </p>
        ))}
      </article>

      <article className="card space-y-3">
        <h2 className="text-base font-medium text-slate-100">Branches</h2>
        {ticket.branches.length === 0 && <p className="text-sm text-slate-300">Sin branches registradas.</p>}
        {ticket.branches.map((branch: { name: string; createdAt: string }) => (
          <p key={`${branch.name}-${branch.createdAt}`} className="text-sm text-slate-300">
            {branch.name} - {new Date(branch.createdAt).toLocaleString("es-ES")}
          </p>
        ))}
      </article>
    </section>
  );
}
