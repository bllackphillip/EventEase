// src/components/SuccessBanner.jsx
import React from "react";

export default function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        backgroundColor: "#e6f4ea",
        color: "#256029",
        padding: "1rem",
        margin: "1rem 0",
        border: "1px solid #c3e6cb",
        borderRadius: "4px",
      }}
    >
      {message}
    </div>
  );
}
