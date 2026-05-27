"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  ticketId: string;
  ticketTitle: string;
  onClose: () => void;
};

export function DeleteTicketModal({ open, ticketId, ticketTitle, onClose }: Props) {
  const router = useRouter();
  const [confirmTitle, setConfirmTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = useMemo(() => confirmTitle.trim() === ticketTitle.trim(), [confirmTitle, ticketTitle]);

  useEffect(() => {
    if (!open) {
      setConfirmTitle("");
      setError(null);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function handleDelete() {
    if (!canDelete || loading) return;
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/tickets/${ticketId}`, { method: "DELETE" });
    setLoading(false);

    if (!response.ok) {
      setError("No se pudo eliminar el ticket. Intenta nuevamente.");
      return;
    }

    onClose();
    router.push("/");
    router.refresh();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/70" aria-label="Cerrar modal" onClick={onClose} />
      <div className="surface relative z-10 w-full max-w-lg space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-50">Eliminar ticket</h2>
        <p className="text-sm text-slate-300">
          Esta accion no se puede deshacer. Para confirmar, escribe el titulo del ticket:
        </p>
        <p className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 font-mono text-sm text-slate-200">
          {ticketTitle}
        </p>
        <input
          className="field"
          placeholder={ticketTitle}
          value={confirmTitle}
          onChange={(e) => setConfirmTitle(e.target.value)}
          autoFocus
        />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50"
            disabled={!canDelete || loading}
            onClick={handleDelete}
          >
            {loading ? "Eliminando..." : "Eliminar ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}
