import Lead from "../models/Lead.js";
import { logActivity } from "../utils/logActivity.js";

export const getLeads = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { owner: req.user._id };
    if (status) query.status = status;

    const leads = await Lead.find(query).populate("contact", "name email company").sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    next(error);
  }
};

export const getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, owner: req.user._id }).populate("contact");
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const lead = await Lead.create({ ...req.body, owner: req.user._id });

    await logActivity({
      owner: req.user._id,
      type: "Note",
      title: `New lead created: ${lead.title}`,
      description: `Status: ${lead.status} · Value: $${lead.value || 0}`,
      lead: lead._id,
      contact: lead.contact,
    });

    res.status(201).json(lead);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const existing = await Lead.findOne({ _id: req.params.id, owner: req.user._id });
    if (!existing) return res.status(404).json({ message: "Lead not found" });

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (req.body.status && req.body.status !== existing.status) {
      await logActivity({
        owner: req.user._id,
        type: "Status Change",
        title: `Lead "${lead.title}" moved to ${lead.status}`,
        lead: lead._id,
        contact: lead.contact,
      });
    }

    res.json(lead);
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json({ message: "Lead deleted" });
  } catch (error) {
    next(error);
  }
};
