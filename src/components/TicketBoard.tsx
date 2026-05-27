"use client";

import { TicketSortableGrid } from "@/components/TicketSortableGrid";
import type { Ticket } from "@/types/ticket";

type Props = {
  tickets: Ticket[];
};

export function TicketBoard({ tickets }: Props) {
  return <TicketSortableGrid tickets={tickets} />;
}
