import Activity from "../models/Activity.js";

export const getActivities = async (req, res, next) => {
  try {
    const { contact, lead, deal, type, limit } = req.query;
    const query = { owner: req.user._id };
    if (contact) query.contact = contact;
    if (lead) query.lead = lead;
    if (deal) query.deal = deal;
    if (type) query.type = type;

    const activities = await Activity.find(query)
      .populate("contact", "name company")
      .populate("lead", "title")
      .populate("deal", "title")
      .sort({ createdAt: -1 })
      .limit(limit ? Number(limit) : 200);

    res.json(activities);
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (req, res, next) => {
  try {
    const activity = await Activity.create({ ...req.body, owner: req.user._id });
    const populated = await activity.populate([
      { path: "contact", select: "name company" },
      { path: "lead", select: "title" },
      { path: "deal", select: "title" },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json({ message: "Activity deleted" });
  } catch (error) {
    next(error);
  }
};
