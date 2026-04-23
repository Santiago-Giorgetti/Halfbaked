import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { TicketForm } from "@/components/TicketForm";
import { authOptions } from "@/lib/auth";

export default async function NewTicketPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }

  return (
    <section className="space-y-5">
      <Link href="/" className="muted hover:text-slate-200">
        Volver
      </Link>
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">Crear ticket</h1>
        <p className="muted">Completa los datos base y define su checklist inicial.</p>
      </header>
      <TicketForm mode="create" />
    </section>
  );
}
