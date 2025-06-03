import React, { useState, useEffect } from "react";
import ErrorBanner from "./ErrorBanner";

export default function TicketList({
  eventID,
  currentUser,
  ticketRefresh,
  setSuccessMessage,
  onBookSuccess,
}) {
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState("");

  // clear list-local errors on any click
  useEffect(() => {
    const clear = () => setError("");
    window.addEventListener("click", clear);
    return () => window.removeEventListener("click", clear);
  }, []);

  // re-fetch tickets on eventID or refresh bump
  useEffect(() => {
    const fetchTickets = async () => {
      setError("");
      setTickets(null);
      try {
        const res = await fetch(`/events/${eventID}/tickets`);
        if (!res.ok) {
          const { error: msg } = await res.json();
          throw new Error(msg);
        }
        setTickets(await res.json());
      } catch (e) {
        setError(e.message);
      }
    };
    fetchTickets();
  }, [eventID, ticketRefresh]);

  const handleBook = async (ticketType) => {
    setError("");
    if (!currentUser) {
      alert("You must be logged in to book tickets");
      return;
    }

    const qtyStr = prompt("Enter quantity to book:");
    const quantity = Number(qtyStr);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Invalid quantity: must be a positive integer");
      return;
    }

    try {
      const res = await fetch(`/events/${eventID}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketType,
          quantity,
          username: currentUser.username,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMessage(`Success! ${data.remaining} remaining.`);
      onBookSuccess(eventID);
    } catch (e) {
      setError(`Booking failed: ${e.message}`);
    }
  };

  if (error) return <ErrorBanner message={error} />;
  if (!tickets) return <p>Loading tickets…</p>;

  return (
    <ul>
      {tickets.map((t) => (
        <li key={t.ticketType} style={{ marginBottom: "0.5rem" }}>
          {t.ticketType} – £{t.price.toFixed(2)} ({t.availability} left){" "}
          <button onClick={() => handleBook(t.ticketType)}>Book</button>
        </li>
      ))}
    </ul>
  );
}
