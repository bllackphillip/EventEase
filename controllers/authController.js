// controllers/authController.js
import * as userDao from "../daos/userDao.js";

export async function signup(req, res) {
  const { username, password } = req.body;
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username.trim() ||
    !password
  ) {
    return res.status(400).json({ error: "Username & password required" });
  }
  try {
    const user = userDao.createUser(username.trim(), password);
    req.session.username = user.username;
    req.session.isAdmin = user.isAdmin;
    res.json({ username: user.username, isAdmin: user.isAdmin });
  } catch (e) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Username already exists" });
    }
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
}

export function getLogin(req, res) {
  res.json({
    username: req.session.username || null,
    isAdmin: req.session.isAdmin || 0,
  });
}

export function login(req, res) {
  const { username, password } = req.body;
  if (typeof username !== "string" || typeof password !== "string") {
    return res
      .status(400)
      .json({ error: "Username and password must be strings" });
  }
  const user = userDao.getUserByUsername(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  req.session.username = user.username;
  req.session.isAdmin = user.isAdmin;
  res.json({ username: user.username, isAdmin: user.isAdmin });
}

export function logout(_req, res) {
  // session will be destroyed client-side by unset:"destroy"
  res.json({ success: true });
}
