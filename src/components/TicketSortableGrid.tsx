"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TicketCard } from "@/components/TicketCard";
import { DeleteTicketModal } from "@/components/DeleteTicketModal";
import type { Ticket } from "@/types/ticket";

type Props = {
  tickets: Ticket[];
};

type DeleteTarget = {
  id: string;
  title: string;
};

export function TicketSortableGrid({ tickets: initialTickets }: Props) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const orderedTickets = useMemo(
    () => [...tickets].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [tickets]
  );

  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  async function updateSortOrder(ticketId: string, sortOrder: number) {
    const previous = tickets;
    setTickets((current) =>
      current.map((ticket) => (ticket._id === ticketId ? { ...ticket, sortOrder } : ticket))
    );

    const response = await fetch(`/api/tickets/${ticketId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sortOrder })
    });

    if (!response.ok) {
      setTickets(previous);
      return;
    }

    router.refresh();
  }

  function handleDrop(targetTicketId: string) {
    if (!draggingId || draggingId === targetTicketId) return;

    const list = orderedTickets.filter((ticket) => ticket._id !== draggingId);
    const targetIndex = list.findIndex((ticket) => ticket._id === targetTicketId);
    if (targetIndex === -1) return;

    const prev = list[targetIndex - 1];
    const next = list[targetIndex];
    let sortOrder = Date.now();

    if (prev && next) {
      sortOrder = (prev.sortOrder + next.sortOrder) / 2;
    } else if (next) {
      sortOrder = next.sortOrder - 1;
    } else if (prev) {
      sortOrder = prev.sortOrder + 1;
    }

    void updateSortOrder(draggingId, sortOrder);
    setDraggingId(null);
    setDropTargetId(null);
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {orderedTickets.map((ticket) => (
          <div
            key={ticket._id}
            draggable
            onDragStart={() => setDraggingId(ticket._id)}
            onDragEnd={() => {
              setDraggingId(null);
              setDropTargetId(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (draggingId && draggingId !== ticket._id) {
                setDropTargetId(ticket._id);
              }
            }}
            onDragLeave={() => setDropTargetId((current) => (current === ticket._id ? null : current))}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(ticket._id);
            }}
            className={`transition ${
              draggingId === ticket._id
                ? "opacity-50"
                : dropTargetId === ticket._id
                  ? "ring-2 ring-amber-400/60 ring-offset-2 ring-offset-transparent rounded-2xl"
                  : ""
            }`}
          >
            <TicketCard
              ticket={ticket}
              draggable
              onDelete={() => setDeleteTarget({ id: ticket._id, title: ticket.title })}
            />
          </div>
        ))}
      </div>

      {deleteTarget && (
        <DeleteTicketModal
          open
          ticketId={deleteTarget.id}
          ticketTitle={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
