// src/components/EventPanel.jsx
import React from "react";
import EventList from "./EventList";
import EventMap from "./EventMap";

export default function EventPanel({ events, onSelectEvent, currentUser }) {
  return (
    <div style={{ display: "flex", marginTop: "2rem" }}>
      <div style={{ flex: 1, marginRight: "1rem" }}>
        <EventList events={events} onSelectEvent={onSelectEvent} />
      </div>
      <div style={{ flex: 1 }}>
        <EventMap
          events={events}
          onMarkerClick={onSelectEvent}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
