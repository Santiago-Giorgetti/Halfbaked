"use client";

import { useState } from "react";
import Link from "next/link";
import { DeleteTicketModal } from "@/components/DeleteTicketModal";

type Props = {
  ticketId: string;
  ticketTitle: string;
};

export function TicketDetailActions({ ticketId, ticketTitle }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/tickets/${ticketId}/edit`} className="btn btn-secondary">
          Editar
        </Link>
        <button type="button" className="btn bg-rose-900/40 text-rose-200 hover:bg-rose-900/60" onClick={() => setDeleteOpen(true)}>
          Eliminar
        </button>
      </div>
      <DeleteTicketModal
        open={deleteOpen}
        ticketId={ticketId}
        ticketTitle={ticketTitle}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
