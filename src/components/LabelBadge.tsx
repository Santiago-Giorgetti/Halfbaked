import { humanizeLabel } from "@/lib/ticket-logic";

type Props = {
  value: string;
};

export function LabelBadge({ value }: Props) {
  return <span className="badge bg-slate-800 text-slate-300">{humanizeLabel(value)}</span>;
}
