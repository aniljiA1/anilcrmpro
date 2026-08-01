import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["Call", "Email", "Meeting", "Note", "Status Change", "Task", "Deal", "Invoice", "Contact"],
      default: "Note",
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: "Deal" },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
