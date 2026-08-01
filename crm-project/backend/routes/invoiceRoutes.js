import express from "express";
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePDF,
  emailInvoice,
} from "../controllers/invoiceController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.route("/").get(getInvoices).post(createInvoice);
router.route("/:id").get(getInvoice).put(updateInvoice).delete(deleteInvoice);
router.get("/:id/pdf", downloadInvoicePDF);
router.post("/:id/send-email", emailInvoice);

export default router;
