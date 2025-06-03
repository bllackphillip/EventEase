import React, { useState } from "react";
import ErrorBanner from "./ErrorBanner";

export default function AddEvent({ currentUser, onAdd, setSuccessMessage }) {
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [lon, setLon] = useState("");
  const [lat, setLat] = useState("");
  const [desc, setDesc] = useState("");

  if (!currentUser || currentUser.isAdmin !== 1) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          location,
          date,
          lon: parseFloat(lon),
          lat: parseFloat(lat),
          description: desc,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Ensure the new event always has an array of ticketTypes
      onAdd({ ...data, ticketTypes: [] });

      setSuccessMessage(`Event "${data.name}" created!`);
      setShow(false);
      // clear form
      setName("");
      setCategory("");
      setLocation("");
      setDate("");
      setLon("");
      setLat("");
      setDesc("");
    } catch (err) {
      setError(`Add event failed: ${err.message}`);
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
        Add Event
      </button>

      {show && (
        <form onSubmit={submit} style={{ marginTop: "1rem" }}>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <br />
          <input
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <br />
          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <br />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <br />
          <input
            placeholder="Longitude"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
          />
          <br />
          <input
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />
          <br />
          <textarea
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <br />
          <button type="submit">Create Event</button>
        </form>
      )}
    </>
  );
}
