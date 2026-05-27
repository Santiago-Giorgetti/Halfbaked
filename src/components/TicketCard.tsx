"use client";

import Link from "next/link";
import { isInconsistent, progressFraction } from "@/lib/ticket-logic";
import { LabelBadge } from "@/components/LabelBadge";
import type { Ticket } from "@/types/ticket";

type Props = {
  ticket: Ticket;
  className?: string;
  draggable?: boolean;
  onDelete?: () => void;
};

export function TicketCard({ ticket, className = "", draggable = false, onDelete }: Props) {
  const inconsistent = isInconsistent(ticket.mainStatus, ticket.checklist ?? []);

  return (
    <article
      className={`card flex h-full min-h-0 flex-col gap-4 ${draggable ? "cursor-grab active:cursor-grabbing" : ""} ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/tickets/${ticket._id}`}
          className="text-lg font-medium tracking-tight text-slate-100 hover:text-white"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {ticket.title}
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <span className="badge bg-slate-800 text-slate-200">{ticket.mainStatus}</span>
          {onDelete && (
            <button
              type="button"
              className="text-xs text-rose-300 hover:text-rose-200"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <p className="flex-1 text-sm leading-relaxed text-slate-300">{ticket.description || "Sin descripcion"}</p>

      <div className="flex flex-wrap gap-2">
        {(ticket.labels ?? []).map((label) => (
          <LabelBadge key={label} value={label} />
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-3 text-sm text-slate-400">
        <span>Checklist {progressFraction(ticket.checklist ?? [])}</span>
        {inconsistent && <span className="badge border-rose-800 bg-rose-900/30 text-rose-200">Inconsistente</span>}
      </div>
    </article>
  );
}
