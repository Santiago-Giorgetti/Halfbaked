import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function AuthButtons() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  const userName = session?.user?.name ?? "Usuario";

  if (!userEmail) {
    return (
      <Link href="/api/auth/signin/google" className="btn btn-primary">
        Iniciar con Google
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-slate-200">{userName}</p>
        <p className="text-xs text-slate-400">{userEmail}</p>
      </div>
      <Link href="/api/auth/signout" className="btn btn-secondary">
        Salir
      </Link>
    </div>
  );
}
