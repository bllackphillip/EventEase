// src/components/EventList.jsx
import React from "react";
import EventCard from "./EventCard";

export default function EventList({ events, onSelectEvent }) {
  if (events.length === 0) {
    return <p>No events to display.</p>;
  }
  return (
    <div>
      {events.map((evt) => (
        <EventCard key={evt.id} event={evt} onSelect={onSelectEvent} />
      ))}
    </div>
  );
}
