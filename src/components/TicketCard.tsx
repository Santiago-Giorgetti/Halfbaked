"use client";

import Link from "next/link";
import { isInconsistent, progressFraction } from "@/lib/ticket-logic";
import { LabelBadge } from "@/components/LabelBadge";
import type { Ticket } from "@/types/ticket";

type Props = {
  ticket: Ticket;
};

export function TicketCard({ ticket }: Props) {
  const inconsistent = isInconsistent(ticket.mainStatus, ticket.checklist);

  return (
    <article className="card space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/tickets/${ticket._id}`} className="text-lg font-medium tracking-tight text-slate-100 hover:text-white">
          {ticket.title}
        </Link>
        <span className="badge bg-slate-800 text-slate-200">{ticket.mainStatus}</span>
      </div>

      <p className="text-sm leading-relaxed text-slate-300">{ticket.description || "Sin descripcion"}</p>

      <div className="flex flex-wrap gap-2">
        {(ticket.labels ?? []).map((label) => (
          <LabelBadge key={label} value={label} />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-sm text-slate-400">
        <span>Checklist {progressFraction(ticket.checklist ?? [])}</span>
        {inconsistent && <span className="badge border-rose-800 bg-rose-900/30 text-rose-200">Inconsistente</span>}
      </div>
    </article>
  );
}
