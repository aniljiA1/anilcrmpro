import express from "express";
import {
  aiChat,
  generateEmail,
  scoreLead,
  summarizeContact,
} from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.post("/chat", aiChat);
router.post("/generate-email", generateEmail);
router.post("/score-lead/:id", scoreLead);
router.post("/summarize-contact/:id", summarizeContact);

export default router;
