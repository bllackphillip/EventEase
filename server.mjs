// server.mjs
import path from "path";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import expressSession from "express-session";
import betterSqlite3Session from "express-session-better-sqlite3";
import Database from "better-sqlite3";

import authRouter from "./routers/authRouter.js";
import eventRouter from "./routers/eventRouter.js";
import ticketRouter from "./routers/ticketRouter.js";
import db from "./db.js";

const __dirname = path.resolve();
const app = express();

// ─── Helmet with custom CSP ─────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "data:"],
        imgSrc: [
          "'self'",
          "data:",
          "https://a.tile.openstreetmap.org",
          "https://b.tile.openstreetmap.org",
          "https://c.tile.openstreetmap.org",
        ],
        connectSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
  })
);

// ─── Rate limiter ───────────────────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ─── JSON parsing ───────────────────────────────────────────────────────────
app.use(express.json());

// ─── Sessions ───────────────────────────────────────────────────────────────
const sessionDb = new Database(path.join(__dirname, "session.db"));
const SqliteStore = betterSqlite3Session(expressSession, sessionDb);

app.use(
  expressSession({
    store: new SqliteStore(),
    secret: "aVerySecretString!!!",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    unset: "destroy",
    cookie: {
      maxAge: 1000 * 60 * 10,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// make main DB available to controllers
app.locals.db = db;

// ─── API Routers ────────────────────────────────────────────────────────────
app.use("/", authRouter);
app.use("/events", eventRouter);
app.use("/events", ticketRouter);

// ─── Serve built React + Leaflet assets ────────────────────────────────────
// 1) your app
app.use(express.static(path.join(__dirname, "dist")));
// 2) leaflet’s images
app.use(
  "/images",
  express.static(path.join(__dirname, "node_modules/leaflet/dist/images"))
);
// 3) SPA fallback
app.get(/.*/, (_req, res) =>
  res.sendFile(path.join(__dirname, "dist", "index.html"))
);

// ─── Start ──────────────────────────────────────────────────────────────────
app.listen(3000, () =>
  console.log("Server listening on http://localhost:3000")
);
