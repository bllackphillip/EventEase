// controllers/ticketController.js
import * as ticketDao from "../daos/ticketDao.js";

export function getTickets(req, res) {
  const eventID = Number(req.params.eventID);
  if (Number.isNaN(eventID)) {
    return res.status(400).json({ error: "Invalid event ID" });
  }
  try {
    const tix = ticketDao.getTicketsByEvent(eventID);
    if (!tix.length) {
      return res
        .status(404)
        .json({ error: `No tickets found for event ${eventID}` });
    }
    res.json(tix);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
}

export function addTickets(req, res) {
  if (!req.session.username || req.session.isAdmin !== 1) {
    return res.status(401).json({ error: "Admins only" });
  }
  const eventID = Number(req.params.eventID);
  const { ticketType, price, availability } = req.body;

  if (
    Number.isNaN(eventID) ||
    typeof ticketType !== "string" ||
    typeof price !== "number" ||
    !Number.isInteger(availability)
  ) {
    return res.status(400).json({ error: "Invalid event ID or ticket fields" });
  }
  if (!ticketType.trim() || price < 0 || availability < 0) {
    return res.status(400).json({ error: "Missing or invalid values" });
  }
  try {
    const row = ticketDao.addTickets(
      eventID,
      ticketType.trim(),
      price,
      availability
    );
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
}
