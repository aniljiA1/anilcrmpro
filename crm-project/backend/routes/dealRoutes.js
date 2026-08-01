import express from "express";
import {
  getDeals,
  getDeal,
  createDeal,
  updateDeal,
  deleteDeal,
} from "../controllers/dealController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.route("/").get(getDeals).post(createDeal);
router.route("/:id").get(getDeal).put(updateDeal).delete(deleteDeal);

export default router;
