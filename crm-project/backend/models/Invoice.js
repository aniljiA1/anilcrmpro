import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: "Deal" },
    invoiceNumber: { type: String, required: true },
    items: { type: [invoiceItemSchema], default: [] },
    taxRate: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Draft", "Sent", "Paid", "Overdue", "Cancelled"],
      default: "Draft",
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

invoiceSchema.virtual("subtotal").get(function () {
  return (this.items || []).reduce((sum, i) => sum + i.quantity * i.price, 0);
});
invoiceSchema.virtual("taxAmount").get(function () {
  return (this.subtotal * (this.taxRate || 0)) / 100;
});
invoiceSchema.virtual("total").get(function () {
  return Math.max(0, this.subtotal + this.taxAmount - (this.discount || 0));
});

invoiceSchema.set("toJSON", { virtuals: true });
invoiceSchema.set("toObject", { virtuals: true });

export default mongoose.model("Invoice", invoiceSchema);
