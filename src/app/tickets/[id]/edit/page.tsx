import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { TicketForm } from "@/components/TicketForm";
import { connectToDatabase } from "@/lib/mongodb";
import { TicketModel } from "@/models/Ticket";

type Props = {
  params: { id: string };
};

export default async function EditTicketPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const ownerEmail = session?.user?.email;
  if (!ownerEmail) notFound();

  await connectToDatabase();
  const ticket = await TicketModel.findOne({ _id: params.id, ownerEmail }).lean();

  if (!ticket) notFound();

  return (
    <section className="space-y-5">
      <Link href={`/tickets/${params.id}`} className="muted hover:text-slate-200">
        Volver al detalle
      </Link>
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">Editar ticket</h1>
        <p className="muted">Ajusta estado, labels y checklist sin perder historial.</p>
      </header>
      <TicketForm mode="edit" initialData={JSON.parse(JSON.stringify(ticket))} />
    </section>
  );
}
