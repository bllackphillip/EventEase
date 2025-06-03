// src/components/AuthBar.jsx
import React from "react";

export default function AuthBar({ currentUser, onSignup, onLogin, onLogout }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {currentUser ? (
        <>
          Logged in as <strong>{currentUser.username}</strong>
          <button onClick={onLogout} style={{ marginLeft: "1rem" }}>
            Logout
          </button>
        </>
      ) : (
        <>
          <button onClick={onSignup} style={{ marginRight: "0.5rem" }}>
            Signup
          </button>
          <button onClick={onLogin}>Login</button>
        </>
      )}
    </div>
  );
}
