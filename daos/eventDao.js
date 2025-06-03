// daos/eventDao.js
import db from "../db.js";

export function createEvent({
  name,
  category,
  location,
  date,
  lon,
  lat,
  description,
}) {
  const info = db
    .prepare(
      `INSERT INTO events
         (name,category,location,date,lon,lat,description)
       VALUES
         ($n,$c,$l,$d,$lon,$lat,$desc)`
    )
    .run({
      n: name,
      c: category,
      l: location,
      d: date, // already converted to YYMMDD by controller
      lon,
      lat,
      desc: description,
    });
  return db
    .prepare(`SELECT * FROM events WHERE id = $id`)
    .get({ id: info.lastInsertRowid });
}

export function getEventsByLocation(locParam) {
  // case-insensitive match
  return db
    .prepare(
      `SELECT id,name,category,location,date,lon,lat,description
         FROM events
        WHERE lower(location) = $loc`
    )
    .all({ loc: locParam.toLowerCase() });
}
