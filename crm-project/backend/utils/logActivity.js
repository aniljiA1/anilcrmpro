import Activity from "../models/Activity.js";

// Fire-and-forget activity logger. Never throws — a logging failure
// should never break the actual CRUD operation that triggered it.
export const logActivity = async ({ owner, type = "Note", title, description = "", contact, lead, deal }) => {
  try {
    await Activity.create({ owner, type, title, description, contact, lead, deal });
  } catch (err) {
    console.error("⚠️  Activity log failed:", err.message);
  }
};
