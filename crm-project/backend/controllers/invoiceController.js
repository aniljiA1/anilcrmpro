import Invoice from "../models/Invoice.js";
import { logActivity } from "../utils/logActivity.js";
import { buildInvoicePDF } from "../utils/pdfGenerator.js";
import { sendMail } from "../utils/mailer.js";

const generateInvoiceNumber = async (ownerId) => {
  const count = await Invoice.countDocuments({ owner: ownerId });
  return `INV-${String(count + 1).padStart(4, "0")}`;
};

export const getInvoices = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { owner: req.user._id };
    if (status) query.status = status;

    const invoices = await Invoice.find(query)
      .populate("contact", "name company email")
      .populate("deal", "title")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, owner: req.user._id })
      .populate("contact")
      .populate("deal");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req, res, next) => {
  try {
    const invoiceNumber = req.body.invoiceNumber?.trim() || (await generateInvoiceNumber(req.user._id));

    const invoice = await Invoice.create({ ...req.body, invoiceNumber, owner: req.user._id });

    await logActivity({
      owner: req.user._id,
      type: "Invoice",
      title: `Invoice ${invoice.invoiceNumber} created`,
      description: `Status: ${invoice.status} · Total: $${invoice.total?.toLocaleString() || 0}`,
      contact: invoice.contact,
      deal: invoice.deal,
    });

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

export const updateInvoice = async (req, res, next) => {
  try {
    const existing = await Invoice.findOne({ _id: req.params.id, owner: req.user._id });
    if (!existing) return res.status(404).json({ message: "Invoice not found" });

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (req.body.status && req.body.status !== existing.status) {
      await logActivity({
        owner: req.user._id,
        type: "Invoice",
        title: `Invoice ${invoice.invoiceNumber} marked as ${invoice.status}`,
        contact: invoice.contact,
        deal: invoice.deal,
      });
    }

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc  Download invoice as a PDF
// @route GET /api/invoices/:id/pdf
export const downloadInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, owner: req.user._id }).populate("contact");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const pdfBuffer = await buildInvoicePDF(invoice);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// @desc  Email the invoice PDF to the contact's email address
// @route POST /api/invoices/:id/send-email
export const emailInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, owner: req.user._id }).populate("contact");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const recipientEmail = req.body.email || invoice.contact?.email;
    if (!recipientEmail) {
      return res.status(400).json({ message: "No recipient email found. Add an email on the contact or pass one explicitly." });
    }

    const pdfBuffer = await buildInvoicePDF(invoice);

    await sendMail({
      to: recipientEmail,
      subject: `Invoice ${invoice.invoiceNumber} from CRM Pro`,
      text: `Hi ${invoice.contact?.name || "there"},\n\nPlease find attached invoice ${invoice.invoiceNumber} for $${invoice.total?.toLocaleString()}.\n\nThank you for your business!`,
      html: `<p>Hi ${invoice.contact?.name || "there"},</p><p>Please find attached invoice <strong>${invoice.invoiceNumber}</strong> for <strong>$${invoice.total?.toLocaleString()}</strong>.</p><p>Thank you for your business!</p>`,
      attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, content: pdfBuffer }],
    });

    if (invoice.status === "Draft") {
      invoice.status = "Sent";
      await invoice.save();
    }

    await logActivity({
      owner: req.user._id,
      type: "Invoice",
      title: `Invoice ${invoice.invoiceNumber} emailed to ${recipientEmail}`,
      contact: invoice.contact?._id,
      deal: invoice.deal,
    });

    res.json({ message: `Invoice emailed to ${recipientEmail}`, invoice });
  } catch (error) {
    next(error);
  }
};
