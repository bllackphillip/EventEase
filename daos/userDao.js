// daos/userDao.js
import db from "../db.js";

export function createUser(username, password) {
  const info = db
    .prepare(
      `INSERT INTO users (username,password,isAdmin)
       VALUES ($u,$p,0)`
    )
    .run({ u: username, p: password });
  return db
    .prepare(`SELECT username,isAdmin FROM users WHERE rowid = $id`)
    .get({ id: info.lastInsertRowid });
}

export function getUserByUsername(username) {
  return db
    .prepare(`SELECT username,password,isAdmin FROM users WHERE username = $u`)
    .get({ u: username });
}
