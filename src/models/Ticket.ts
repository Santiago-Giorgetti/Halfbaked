import mongoose, { Model, Schema } from "mongoose";
import { MAIN_STATUS, type Ticket } from "@/types/ticket";

type TicketDocument = Omit<Ticket, "_id"> & { _id: mongoose.Types.ObjectId };

const checklistSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false }
  },
  { _id: false }
);

const branchSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const statusHistorySchema = new Schema(
  {
    from: { type: String, enum: [...MAIN_STATUS, null], default: null },
    to: { type: String, enum: MAIN_STATUS, required: true },
    date: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ticketSchema = new Schema<TicketDocument>(
  {
    ownerEmail: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    mainStatus: { type: String, enum: MAIN_STATUS, default: "TODO" },
    labels: [{ type: String, trim: true }],
    checklist: [checklistSchema],
    branches: [branchSchema],
    statusHistory: [statusHistorySchema]
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const TicketModel: Model<TicketDocument> =
  (mongoose.models.Ticket as Model<TicketDocument>) || mongoose.model<TicketDocument>("Ticket", ticketSchema);
