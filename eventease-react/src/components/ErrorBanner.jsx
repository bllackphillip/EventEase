// src/components/ErrorBanner.jsx
import React from "react";

export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        backgroundColor: "#fdecea",
        color: "#b71c1c",
        padding: "1rem",
        margin: "1rem 0",
        border: "1px solid #f5c6cb",
        borderRadius: "4px",
      }}
    >
      {message}
    </div>
  );
}
