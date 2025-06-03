import React, { useState } from "react";
import ErrorBanner from "./ErrorBanner";

export default function AddTickets({
  currentUser,
  eventID,
  onAdd,
  setSuccessMessage,
}) {
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("");

  if (!currentUser || currentUser.isAdmin !== 1) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/events/${eventID}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketType: type,
          price: parseFloat(price),
          availability: parseInt(availability, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // notify parent: pass both eventID & new type
      onAdd(eventID, data.ticketType);

      setSuccessMessage(`Added "${data.ticketType}" tickets!`);
      setShow(false);
      setType("");
      setPrice("");
      setAvailability("");
    } catch (err) {
      setError(`Add tickets failed: ${err.message}`);
    }
  };

  return (
    <>
      <ErrorBanner message={error} />

      <button
        onClick={() => {
          setError("");
          setSuccessMessage("");
          setShow((v) => !v);
        }}
      >
        Add Tickets
      </button>

      {show && (
        <form onSubmit={submit} style={{ marginTop: "1rem" }}>
          <input
            placeholder="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <br />
          <input
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <br />
          <input
            placeholder="Availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          />
          <br />
          <button type="submit">Create Ticket</button>
        </form>
      )}
    </>
  );
}
