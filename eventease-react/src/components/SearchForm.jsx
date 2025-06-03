// src/components/SearchForm.jsx
import React from "react";

export default function SearchForm({
  location,
  onLocationChange,
  onSearch,
  error,
}) {
  return (
    <div>
      <input
        type="text"
        placeholder="Location (e.g. London)"
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        style={{ padding: "0.5rem", width: "200px" }}
      />
      <button
        onClick={onSearch}
        style={{ marginLeft: "0.5rem", padding: "0.5rem 1rem" }}
      >
        Search
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
