import Deal from "../models/Deal.js";
import { logActivity } from "../utils/logActivity.js";

export const getDeals = async (req, res, next) => {
  try {
    const { stage } = req.query;
    const query = { owner: req.user._id };
    if (stage) query.stage = stage;

    const deals = await Deal.find(query).populate("contact", "name email company").sort({ createdAt: -1 });
    res.json(deals);
  } catch (error) {
    next(error);
  }
};

export const getDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findOne({ _id: req.params.id, owner: req.user._id }).populate("contact");
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    res.json(deal);
  } catch (error) {
    next(error);
  }
};

export const createDeal = async (req, res, next) => {
  try {
    const deal = await Deal.create({ ...req.body, owner: req.user._id });

    await logActivity({
      owner: req.user._id,
      type: "Deal",
      title: `New deal created: ${deal.title}`,
      description: `Stage: ${deal.stage} · Amount: $${deal.amount || 0}`,
      deal: deal._id,
      contact: deal.contact,
    });

    res.status(201).json(deal);
  } catch (error) {
    next(error);
  }
};

export const updateDeal = async (req, res, next) => {
  try {
    const existing = await Deal.findOne({ _id: req.params.id, owner: req.user._id });
    if (!existing) return res.status(404).json({ message: "Deal not found" });

    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (req.body.stage && req.body.stage !== existing.stage) {
      await logActivity({
        owner: req.user._id,
        type: "Status Change",
        title: `Deal "${deal.title}" moved to ${deal.stage}`,
        deal: deal._id,
        contact: deal.contact,
      });
    }

    res.json(deal);
  } catch (error) {
    next(error);
  }
};

export const deleteDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    res.json({ message: "Deal deleted" });
  } catch (error) {
    next(error);
  }
};
