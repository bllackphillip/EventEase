// controllers/bookingController.js
import * as ticketDao from "../daos/ticketDao.js";
import * as bookingDao from "../daos/bookingDao.js";

export async function bookTickets(req, res) {
  const eventID = Number(req.params.eventID);
  const { ticketType, quantity, username } = req.body;

  // basic validation
  if (
    Number.isNaN(eventID) ||
    typeof ticketType !== "string" ||
    typeof username !== "string" ||
    !Number.isInteger(quantity)
  ) {
    return res.status(400).json({ error: "Invalid booking parameters" });
  }
  // only logged‐in users
  if (!req.session.username) {
    return res.status(401).json({ error: "Must be logged in" });
  }

  try {
    // ─── 1) pull the event date ───────────────────────────────────────────
    const row = req.app.locals.db
      .prepare(`SELECT date FROM events WHERE id = $id`)
      .get({ id: eventID });

    if (!row) {
      return res.status(404).json({ error: "Event not found" });
    }

    // row.date is stored as YYMMDD, e.g. "240512"
    const m = String(row.date).match(/^(\d{2})(\d{2})(\d{2})$/);
    if (!m) {
      console.error("Bad date format in DB:", row.date);
      return res.status(500).json({ error: "Invalid stored date format" });
    }
    const [_, yy, mm, dd] = m.map(Number);
    const eventDate = new Date(2000 + yy, mm - 1, dd);
    // truncate both to midnight
    eventDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      return res
        .status(400)
        .json({ error: "Cannot book tickets for past events" });
    }

    // ─── 2) check availability ──────────────────────────────────────────
    const avail = ticketDao.getAvailability(eventID, ticketType);
    if (!avail) {
      return res
        .status(404)
        .json({ error: `No '${ticketType}' tickets for event ${eventID}` });
    }
    if (avail.availability < quantity) {
      return res.status(400).json({ error: `Only ${avail.availability} left` });
    }

    // ─── 3) deduct + record ─────────────────────────────────────────────
    ticketDao.deductAvailability(eventID, ticketType, quantity);
    bookingDao.recordBooking(eventID, ticketType, username, quantity);

    res.json({ remaining: avail.availability - quantity });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
}
