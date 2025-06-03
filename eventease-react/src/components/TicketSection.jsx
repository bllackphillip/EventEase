// src/components/TicketSection.jsx
import React from "react";
import AddTickets from "./AddTickets";
import TicketList from "./TicketList";

export default function TicketSection({ eventID, currentUser, onAddTickets }) {
  return (
    <div style={{ marginTop: "2rem" }}>
      {currentUser && currentUser.isAdmin === 1 && (
        <AddTickets
          currentUser={currentUser}
          eventID={eventID}
          onAdd={onAddTickets}
        />
      )}
      <h2>Tickets for Event #{eventID}</h2>
      <TicketList eventID={eventID} currentUser={currentUser} />
    </div>
  );
}
