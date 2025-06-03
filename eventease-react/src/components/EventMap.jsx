import React, { useRef, useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ErrorBanner from "./ErrorBanner";

export default function EventMap({
  events,
  onMarkerClick,
  currentUser,
  setSuccessMessage,
  onBookSuccess,
}) {
  const mapRef = useRef(null);
  const [error, setError] = useState("");

  // ── Fix Leaflet’s default icon URLs ─────────────────────────────────────
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/images/marker-icon-2x.png",
      iconUrl: "/images/marker-icon.png",
      shadowUrl: "/images/marker-shadow.png",
    });
  }, []);

  // ── Clear map-local errors on any click ────────────────────────────────
  useEffect(() => {
    const clear = () => setError("");
    window.addEventListener("click", clear);
    return () => window.removeEventListener("click", clear);
  }, []);

  // ── Initialize map ────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = L.map("map", {
      center: [51.505, -0.09],
      zoom: 4,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "Map data © OpenStreetMap contributors",
    }).addTo(mapRef.current);
  }, []);

  // ── Rebuild markers when `events` change ──────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    // remove existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current.removeLayer(layer);
      }
    });

    events.forEach((evt) => {
      if (evt.lat == null || evt.lon == null) return;

      const marker = L.marker([evt.lat, evt.lon]).addTo(mapRef.current);
      marker.on("click", () => onMarkerClick(evt.id));

      const options = evt.ticketTypes
        .map((t) => `<option value="${t}">${t}</option>`)
        .join("");

      marker.bindPopup(`
        <strong>${evt.name}</strong><br/>
        ${evt.date} — ${evt.location}<br/>
        <label>
          Type:
          <select id="tt-${evt.id}">
            ${options}
          </select>
        </label><br/>
        <label>
          Quantity:
          <input type="number" id="qty-${evt.id}" min="1" value="1" style="width:50px;"/>
        </label><br/>
        <button id="btn-${evt.id}">Book</button>
      `);

      marker.on("popupopen", () => {
        const oldBtn = document.getElementById(`btn-${evt.id}`);
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);

        newBtn.addEventListener("click", async () => {
          setError("");
          if (!currentUser) {
            alert("You must be logged in to book tickets");
            return;
          }
          const ticketType = document.getElementById(`tt-${evt.id}`).value;
          const quantity = Number(
            document.getElementById(`qty-${evt.id}`).value
          );
          if (!Number.isInteger(quantity) || quantity <= 0) {
            setError("Invalid quantity");
            return;
          }
          try {
            const res = await fetch(`/events/${evt.id}/book`, {
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
            onBookSuccess(evt.id);
          } catch (e) {
            setError(`Booking failed: ${e.message}`);
          }
        });
      });
    });
  }, [events, onMarkerClick, currentUser, setSuccessMessage, onBookSuccess]);

  return (
    <>
      <ErrorBanner message={error} />
      <div id="map" style={{ height: 400, width: "100%", marginTop: "1rem" }} />
    </>
  );
}
