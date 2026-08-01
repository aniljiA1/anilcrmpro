import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    dueDate: { type: Date },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    completed: { type: Boolean, default: false },
    relatedLead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    relatedDeal: { type: mongoose.Schema.Types.ObjectId, ref: "Deal" },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
