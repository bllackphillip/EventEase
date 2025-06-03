// routers/ticketRouter.js
import express from "express";
import * as tktCtrl from "../controllers/ticketController.js";
import * as bookCtrl from "../controllers/bookingController.js";

const router = express.Router();
// all routes here are mounted under /events
router.get("/:eventID/tickets", tktCtrl.getTickets);
router.post("/:eventID/tickets", tktCtrl.addTickets);
router.post("/:eventID/book", bookCtrl.bookTickets);
export default router;
