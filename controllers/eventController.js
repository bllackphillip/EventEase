// controllers/eventController.js

import { Router } from "express";

// GET /events/location/:location
export function getEventsByLocation(req, res) {
  const locParam = req.params.location.toLowerCase();

  try {
    // 1) fetch the raw event rows
    const evs = req.app.locals.db
      .prepare(
        `
        SELECT id, name, category, location, date, lon, lat, description
          FROM events
         WHERE lower(location) = ?
      `
      )
      .all(locParam);

    if (!evs.length) {
      return res
        .status(404)
        .json({ error: `No events found in '${req.params.location}'` });
    }

    // 2) enrich each event: format date + pull ticketTypes
    const enriched = evs.map((evt) => {
      // convert stored YYMMDD → ISO YYYY-MM-DD
      const m = String(evt.date).match(/^(\d{2})(\d{2})(\d{2})$/);
      if (m) {
        const [_, yy, mm, dd] = m.map(Number);
        evt.date = new Date(2000 + yy, mm - 1, dd).toISOString().slice(0, 10);
      }

      // pull available ticketType list
      const types = req.app.locals.db
        .prepare(
          `
          SELECT ticketType
            FROM tickets
           WHERE eventID = ?
        `
        )
        .all(evt.id)
        .map((r) => r.ticketType);

      evt.ticketTypes = types;
      return evt;
    });

    res.json(enriched);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /events
export function createEvent(req, res) {
  // only admins
  if (!req.session.username || req.session.isAdmin !== 1) {
    return res.status(401).json({ error: "Admins only" });
  }

  const {
    name,
    category,
    location,
    date,
    lon,
    lat,
    description = "",
  } = req.body;

  // 1) type‐checks
  if (
    typeof name !== "string" ||
    typeof category !== "string" ||
    typeof location !== "string" ||
    typeof date !== "string" ||
    typeof lon !== "number" ||
    typeof lat !== "number"
  ) {
    return res
      .status(400)
      .json({ error: "Invalid input types for event fields" });
  }

  // 2) required‐field checks
  if (!name.trim() || !category.trim() || !location.trim() || !date.trim()) {
    return res.status(400).json({ error: "Missing required field" });
  }

  // 3) date format → YYMMDD
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) {
    return res.status(400).json({ error: "Date must be YYYY-MM-DD" });
  }
  const shortDate = m[1].slice(2) + m[2] + m[3];

  try {
    // 4) insert + return the new row
    const info = req.app.locals.db
      .prepare(
        `
        INSERT INTO events
          (name,category,location,date,lon,lat,description)
        VALUES
          ($n,$c,$l,$d,$lon,$lat,$desc)
      `
      )
      .run({
        n: name,
        c: category,
        l: location,
        d: shortDate,
        lon,
        lat,
        desc: description,
      });

    const evt = req.app.locals.db
      .prepare(`SELECT * FROM events WHERE id = ?`)
      .get(info.lastInsertRowid);

    res.json(evt);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
}
