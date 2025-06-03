// daos/ticketDao.js

import db from "../db.js";

/**
 * Fetch all ticket rows for a given event.
 * @param {number} eventID
 * @returns {Array<{ticketType: string, price: number, availability: number}>}
 */
export function getTicketsByEvent(eventID) {
  return db
    .prepare(
      `
      SELECT ticketType, price, availability
        FROM tickets
       WHERE eventID = ?
    `
    )
    .all(eventID);
}

/**
 * Insert a new ticket type/price/availability record,
 * then return the newly‐created row.
 */
export function addTickets(eventID, ticketType, price, availability) {
  const info = db
    .prepare(
      `
      INSERT INTO tickets (eventID, ticketType, price, availability)
      VALUES (?, ?, ?, ?)
    `
    )
    .run(eventID, ticketType, price, availability);

  return db
    .prepare(
      `
      SELECT ticketType, price, availability
        FROM tickets
       WHERE id = ?
    `
    )
    .get(info.lastInsertRowid);
}

/**
 * Look up current availability for a given event & ticket type.
 * @returns {{ availability: number } | undefined}
 */
export function getAvailability(eventID, ticketType) {
  return db
    .prepare(
      `
      SELECT availability
        FROM tickets
       WHERE eventID = ? AND ticketType = ?
    `
    )
    .get(eventID, ticketType);
}

/**
 * Deduct `quantity` from availability.
 */
export function deductAvailability(eventID, ticketType, quantity) {
  return db
    .prepare(
      `
      UPDATE tickets
         SET availability = availability - ?
       WHERE eventID = ? AND ticketType = ?
    `
    )
    .run(quantity, eventID, ticketType);
}
