import express from "express";
import * as evtCtrl from "../controllers/eventController.js";
const router = express.Router();

router.post("/", evtCtrl.createEvent);
router.get("/location/:location", evtCtrl.getEventsByLocation);

export default router;
