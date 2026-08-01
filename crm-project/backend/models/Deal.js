import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
    title: { type: String, required: true, trim: true },
    stage: {
      type: String,
      enum: ["Prospecting", "Proposal", "Negotiation", "Won", "Lost"],
      default: "Prospecting",
    },
    amount: { type: Number, default: 0 },
    closeDate: { type: Date },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Deal", dealSchema);
