"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DEFAULT_CHECKLIST } from "@/lib/ticket-logic";
import {
  MAIN_STATUS,
  TICKET_LABELS,
  type BranchItem,
  type ChecklistItem,
  type MainStatus,
  type Ticket,
  type TicketLabel
} from "@/types/ticket";

type Props = {
  mode: "create" | "edit";
  initialData?: Ticket;
};

export function TicketForm({ mode, initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [branchInput, setBranchInput] = useState("");
  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    mainStatus: (initialData?.mainStatus ?? "TODO") as MainStatus,
    labels: initialData?.labels ?? [],
    checklist: (initialData?.checklist ?? DEFAULT_CHECKLIST) as ChecklistItem[],
    branches: initialData?.branches ?? []
  });

  const canSubmit = useMemo(() => form.title.trim().length > 0, [form.title]);

  function toggleLabel(label: TicketLabel) {
    setForm((prev) => ({
      ...prev,
      labels: prev.labels.includes(label) ? prev.labels.filter((it) => it !== label) : [...prev.labels, label]
    }));
  }

  function addBranch() {
    const normalized = branchInput.trim();
    if (!normalized) return;
    const exists = form.branches.some((branch) => branch.name.toLowerCase() === normalized.toLowerCase());
    if (exists) return;

    const newBranch: BranchItem = {
      name: normalized,
      createdAt: new Date()
    };

    setForm((prev) => ({ ...prev, branches: [...prev.branches, newBranch] }));
    setBranchInput("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setErrorMessage(null);

    const endpoint = mode === "create" ? "/api/tickets" : `/api/tickets/${initialData?._id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setLoading(false);
    if (!response.ok) {
      setErrorMessage("No se pudo guardar el ticket. Intentalo nuevamente.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5">
      <div className="space-y-1">
        <label className="text-sm text-slate-300">Titulo</label>
        <input
          className="field"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-300">Descripcion</label>
        <textarea
          className="field min-h-24"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-300">Estado principal</label>
        <select
          className="field"
          value={form.mainStatus}
          onChange={(e) => setForm((prev) => ({ ...prev, mainStatus: e.target.value as MainStatus }))}
        >
          {MAIN_STATUS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Labels</label>
        <div className="flex flex-wrap gap-2">
          {TICKET_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              className={`badge transition ${
                form.labels.includes(label)
                  ? "border-slate-400 bg-slate-200 text-slate-900"
                  : "bg-slate-800 text-slate-300"
              }`}
              onClick={() => toggleLabel(label)}
            >
              {label === "HECHO_PERO_FALTA_BACKEND" && "Hecho pero falta backend"}
              {label === "HECHO_PERO_FALTA_TESTEAR" && "Hecho pero falta testear"}
              {label === "HECHO_PERO_FALTA_ASIGNAR_QA" && "Hecho pero falta asignar QA"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Checklist</label>
        <div className="space-y-2">
          {form.checklist.map((item, idx) => (
            <div key={`${item.key}-${idx}`} className="flex items-center gap-3">
              <input
                value={item.label}
                className="field"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    checklist: prev.checklist.map((it, i) => (i === idx ? { ...it, label: e.target.value } : it))
                  }))
                }
              />
              <input
                type="checkbox"
                checked={item.done}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-slate-100 focus:ring-slate-500/40"
                onChange={() =>
                  setForm((prev) => ({
                    ...prev,
                    checklist: prev.checklist.map((it, i) => (i === idx ? { ...it, done: !it.done } : it))
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Branches</label>
        <div className="flex gap-2">
          <input
            className="field"
            placeholder="ej: feature/ticket-123"
            value={branchInput}
            onChange={(e) => setBranchInput(e.target.value)}
          />
          <button type="button" onClick={addBranch} className="btn btn-secondary">
            Agregar
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.branches.map((branch) => (
            <button
              key={`${branch.name}-${String(branch.createdAt)}`}
              type="button"
              className="badge bg-slate-800 text-slate-300"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  branches: prev.branches.filter((it) => it.name !== branch.name)
                }))
              }
            >
              {branch.name} x
            </button>
          ))}
        </div>
      </div>

      {errorMessage && <p className="text-sm text-rose-300">{errorMessage}</p>}

      <button
        disabled={!canSubmit || loading}
        type="submit"
        className="btn btn-primary"
      >
        {loading ? "Guardando..." : mode === "create" ? "Crear ticket" : "Guardar cambios"}
      </button>
    </form>
  );
}
