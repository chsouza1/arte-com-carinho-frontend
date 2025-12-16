"use client";

import React from "react";

type Props = {
  phone?: string; 
  message?: string; 
};

export default function WhatsAppFloatingButton({
  phone = "5541999932625",
  message = "Olá! Vim pelo site Arte Com Carinho 😊",
}: Props) {
  const url =
    `https://wa.me/${phone}` + (message ? `?text=${encodeURIComponent(message)}` : "");

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        width: 56,
        height: 56,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        boxShadow: "0 10px 20px rgba(0,0,0,0.18)",
        zIndex: 9999,
        textDecoration: "none",
        background: "#25D366",
        color: "white",
        fontSize: 26,
        fontWeight: 700,
      }}
    >
    <img src="https://img.icons8.com/?size=100&id=7OeRNqg6S7Vf&format=png&color=000000" alt="WhatsApp" style={{ width: 32, height: 32 }} />
    </a>
  );
}
