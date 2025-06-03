// daos/bookingDao.js
import db from "../db.js";

// record the booking
export function recordBooking(eventID, ticketType, username, quantity) {
  return db
    .prepare(
      `INSERT INTO bookings (eventID,ticketType,username,quantity)
       VALUES ($id,$tt,$user,$qty)`
    )
    .run({ id: eventID, tt: ticketType, user: username, qty: quantity });
}
