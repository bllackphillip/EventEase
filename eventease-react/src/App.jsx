import React, { useState, useEffect, useCallback } from "react";
import EventMap from "./components/EventMap";
import TicketList from "./components/TicketList";
import AddEvent from "./components/AddEvent";
import AddTickets from "./components/AddTickets";
import ErrorBanner from "./components/ErrorBanner";
import SuccessBanner from "./components/SuccessBanner";
import "./App.css";

export default function App() {
  // ── Auth & banners ───────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ── Event & ticket state ─────────────────────────────────────
  const [location, setLocation] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedEventID, setEventID] = useState(null);

  // bump to force TicketList re-fetch
  const [ticketRefresh, setTicketRefresh] = useState(0);

  // ── clear banners on next click ───────────────────────────────
  const clearBanners = useCallback(() => {
    if (authError) setAuthError("");
    if (searchError) setSearchError("");
    if (successMessage) setSuccessMessage("");
  }, [authError, searchError, successMessage]);

  // ── auto-scroll to top on any new success banner ─────────────
  useEffect(() => {
    if (successMessage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [successMessage]);

  // ── who’s logged in on load? ──────────────────────────────────
  useEffect(() => {
    fetch("/login")
      .then((r) => r.json())
      .then((data) => {
        if (data.username) {
          setCurrentUser({ username: data.username, isAdmin: data.isAdmin });
          setSuccessMessage(`Welcome back, ${data.username}!`);
        }
      });
  }, []);

  // ── signup / login / logout ───────────────────────────────────
  const handleSignup = async () => {
    clearBanners();
    const username = prompt("Choose a username:");
    if (!username) return;
    const password = prompt("Choose a password:");
    if (!password) return;
    const res = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthError(`Signup failed: ${data.error}`);
      return;
    }
    setCurrentUser({ username: data.username, isAdmin: data.isAdmin });
    setSuccessMessage(`Welcome, ${data.username}!`);
  };

  const handleLogin = async () => {
    clearBanners();
    const username = prompt("Username?");
    const password = prompt("Password?");
    if (!username || !password) return;
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthError(`Login failed: ${data.error}`);
      return;
    }
    setCurrentUser({ username: data.username, isAdmin: data.isAdmin });
    setSuccessMessage(`Logged in as ${data.username}`);
  };

  const handleLogout = async () => {
    clearBanners();
    await fetch("/logout", { method: "POST" });
    setCurrentUser(null);
    setSuccessMessage("You have been logged out");
  };

  // ── search events ─────────────────────────────────────────────
  const searchEvents = async () => {
    clearBanners();
    setEventID(null);
    try {
      const res = await fetch(
        `/events/location/${encodeURIComponent(location)}`
      );
      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg);
      }
      const evs = await res.json();
      setEvents(evs);
      setSuccessMessage(
        `Found ${evs.length} event${evs.length !== 1 ? "s" : ""}`
      );
    } catch (e) {
      setSearchError(e.message);
      setEvents([]);
    }
  };

  // ── only add a newly created event if it matches the current filter ───
  const handleAddEvent = useCallback(
    (evt) => {
      if (evt.location.toLowerCase() === location.toLowerCase()) {
        setEvents((es) => [...es, evt]);
      }
    },
    [location]
  );

  // ── after tickets are added, bump refresh to re-fetch TicketList ─────
  const handleTicketsAdded = useCallback((eventID, newType) => {
    setEvents((es) =>
      es.map((evt) =>
        evt.id === eventID
          ? { ...evt, ticketTypes: [...evt.ticketTypes, newType] }
          : evt
      )
    );
    setTicketRefresh((n) => n + 1);
  }, []);

  // ── after any booking from map or list, bump the counter ─────────────
  const handleBookingSuccess = useCallback(() => {
    setTicketRefresh((n) => n + 1);
  }, []);

  // ── unified “view tickets” that clears banners + forces remount ───────
  const handleSelectEvent = useCallback(
    (id) => {
      clearBanners();
      setEventID(null);
      setTimeout(() => setEventID(id), 0);
    },
    [clearBanners]
  );

  return (
    // any click anywhere clears top-level banners
    <div
      onClick={clearBanners}
      style={{ padding: "2rem", fontFamily: "sans-serif" }}
    >
      {/* AUTH BAR */}
      <div style={{ marginBottom: "1rem" }}>
        <ErrorBanner message={authError} />
        <SuccessBanner message={successMessage} />
        {currentUser ? (
          <>
            Logged in as <strong>{currentUser.username}</strong>
            <button onClick={handleLogout} style={{ marginLeft: "1rem" }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={handleSignup}>Signup</button>{" "}
            <button onClick={handleLogin}>Login</button>
          </>
        )}
      </div>

      {/* ADMIN: Add Event */}
      <AddEvent
        currentUser={currentUser}
        onAdd={handleAddEvent}
        setSuccessMessage={setSuccessMessage}
      />

      <h1>🔍 EventEase: Search Events</h1>
      <input
        type="text"
        placeholder="Location (e.g. London)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={{ padding: "0.5rem", width: "200px" }}
      />
      <button onClick={searchEvents} style={{ marginLeft: "0.5rem" }}>
        Search
      </button>
      <ErrorBanner message={searchError} />

      {/* LIST & MAP */}
      <div style={{ display: "flex", marginTop: "2rem" }}>
        <div style={{ flex: 1, marginRight: "1rem" }}>
          {events.length === 0 && !searchError && <p>No events to display.</p>}
          {events.map((evt) => (
            <div
              key={evt.id}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h2>{evt.name}</h2>
              <p>
                <strong>When:</strong> {evt.date}
              </p>
              <p>
                <strong>Where:</strong> {evt.location}
              </p>
              <p>{evt.description}</p>
              <button onClick={() => handleSelectEvent(evt.id)}>
                View Tickets
              </button>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <EventMap
            events={events}
            onMarkerClick={handleSelectEvent}
            currentUser={currentUser}
            setSuccessMessage={setSuccessMessage}
            onBookSuccess={handleBookingSuccess}
          />
        </div>
      </div>

      {/* ADMIN: Add Tickets */}
      {selectedEventID && currentUser?.isAdmin === 1 && (
        <AddTickets
          currentUser={currentUser}
          eventID={selectedEventID}
          onAdd={handleTicketsAdded}
          setSuccessMessage={setSuccessMessage}
        />
      )}

      {/* TICKET LIST */}
      {selectedEventID && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Tickets for Event #{selectedEventID}</h2>
          <TicketList
            eventID={selectedEventID}
            currentUser={currentUser}
            ticketRefresh={ticketRefresh}
            setSuccessMessage={setSuccessMessage}
            onBookSuccess={handleBookingSuccess}
          />
        </div>
      )}
    </div>
  );
}
