import Contact from "../models/Contact.js";
import Lead from "../models/Lead.js";
import Deal from "../models/Deal.js";
import Task from "../models/Task.js";
import Invoice from "../models/Invoice.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const [totalContacts, totalLeads, totalDeals, openTasks, deals, leadsByStatus, invoices] = await Promise.all([
      Contact.countDocuments({ owner: ownerId }),
      Lead.countDocuments({ owner: ownerId }),
      Deal.countDocuments({ owner: ownerId }),
      Task.countDocuments({ owner: ownerId, completed: false }),
      Deal.find({ owner: ownerId }),
      Lead.aggregate([
        { $match: { owner: ownerId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Invoice.find({ owner: ownerId }),
    ]);

    const pipelineValue = deals
      .filter((d) => d.stage !== "Lost")
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    const wonValue = deals
      .filter((d) => d.stage === "Won")
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    const dealsByStage = deals.reduce((acc, d) => {
      acc[d.stage] = (acc[d.stage] || 0) + 1;
      return acc;
    }, {});

    const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
    const totalPaid = invoices
      .filter((i) => i.status === "Paid")
      .reduce((sum, i) => sum + (i.total || 0), 0);
    const outstanding = invoices
      .filter((i) => ["Sent", "Overdue"].includes(i.status))
      .reduce((sum, i) => sum + (i.total || 0), 0);

    res.json({
      totalContacts,
      totalLeads,
      totalDeals,
      openTasks,
      pipelineValue,
      wonValue,
      dealsByStage,
      leadsByStatus,
      totalInvoiced,
      totalPaid,
      outstanding,
      totalInvoices: invoices.length,
    });
  } catch (error) {
    next(error);
  }
};
