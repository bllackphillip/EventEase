// src/components/EventCard.jsx
import React from "react";

export default function EventCard({ event, onSelect }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        marginBottom: "1rem",
      }}
    >
      <h2>{event.name}</h2>
      <p>
        <strong>When:</strong> {event.date}
      </p>
      <p>
        <strong>Where:</strong> {event.location}
      </p>
      <p>{event.description}</p>
      <button onClick={() => onSelect(event.id)}>View Tickets</button>
    </div>
  );
}
