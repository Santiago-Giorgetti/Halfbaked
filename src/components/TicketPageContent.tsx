"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { TicketSortableGrid } from "@/components/TicketSortableGrid";
import type { Ticket } from "@/types/ticket";

type Props = {
  tickets: Ticket[];
  authSlot: ReactNode;
};

export function TicketPageContent({ tickets, authSlot }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return tickets;
    return tickets.filter((t) => t.ticketID != null && String(t.ticketID).includes(q));
  }, [tickets, query]);

  return (
    <section className="space-y-6">
      <div className="fixed right-6 top-6 z-50">
        <div className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950/90 px-4 py-2.5 shadow-lg backdrop-blur-sm transition-colors focus-within:border-slate-500">
          <span className="select-none font-mono text-sm text-slate-500">#</span>
          <input
            type="number"
            min={1}
            className="w-64 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder="Buscar por número de ticket."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <header className="surface flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="muted uppercase tracking-[0.2em]">Workspace</p>
          <h1 className="heading-xl">Gestor de tickets</h1>
          <p className="muted">Seguimiento claro de tareas, estados y avance tecnico. Arrastra para reordenar.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/tickets/new" className="btn btn-primary">
            Nuevo ticket
          </Link>
          {authSlot}
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="surface p-10 text-center">
          <p className="text-sm text-slate-300">
            {query.trim() ? "No hay tickets con ese número." : "No hay tickets todavia. Crea el primero para empezar."}
          </p>
        </div>
      ) : (
        <TicketSortableGrid key={query} tickets={filtered} />
      )}
    </section>
  );
}
