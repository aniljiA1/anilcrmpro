import express from "express";
import { getActivities, createActivity, deleteActivity } from "../controllers/activityController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.route("/").get(getActivities).post(createActivity);
router.delete("/:id", deleteActivity);

export default router;
