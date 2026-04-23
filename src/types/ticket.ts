export const MAIN_STATUS = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE", "QA", "PROD"] as const;
export const TICKET_LABELS = [
  "HECHO_PERO_FALTA_BACKEND",
  "HECHO_PERO_FALTA_TESTEAR",
  "HECHO_PERO_FALTA_ASIGNAR_QA"
] as const;

export type MainStatus = (typeof MAIN_STATUS)[number];
export type TicketLabel = (typeof TICKET_LABELS)[number];

export type ChecklistItem = {
  key: string;
  label: string;
  done: boolean;
};

export type BranchItem = {
  name: string;
  createdAt: Date;
};

export type StatusHistoryItem = {
  from: MainStatus | null;
  to: MainStatus;
  date: Date;
};

export type Ticket = {
  _id: string;
  ownerEmail: string;
  title: string;
  description: string;
  mainStatus: MainStatus;
  labels: TicketLabel[];
  checklist: ChecklistItem[];
  branches: BranchItem[];
  statusHistory: StatusHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
};

export type TicketInput = Omit<Ticket, "_id" | "createdAt" | "updatedAt" | "statusHistory"> & {
  statusHistory?: StatusHistoryItem[];
};
