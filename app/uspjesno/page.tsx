"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function UspjesnoPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
  window.history.pushState(null, "", window.location.href);

  const handlePopState = () => {
    window.history.pushState(null, "", window.location.href);
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, []);

  const salon = searchParams.get("salon");
  const salonSlug = searchParams.get("salonSlug");
  const service = searchParams.get("service");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const email = searchParams.get("email");
  const ime = searchParams.get("ime");
const prezime = searchParams.get("prezime");

const formattedDate = date
  ? `${date.split("-")[2]}.${date.split("-")[1]}.${date.split("-")[0]}.`
  : "";

  return (
  <main
    style={{
      minHeight: "100vh",
      backgroundColor: "#611a1a",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "24px",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
        backgroundColor: "white",
        borderRadius: "28px",
        padding: "28px",
        textAlign: "center",
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "999px",
          backgroundColor: "#611a1a",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          fontWeight: "bold",
          margin: "0 auto 16px",
        }}
      >
        ✓
      </div>

      <h1 style={{ color: "#611a1a", fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
        Rezervacija potvrđena
      </h1>

      <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
        Vaš termin je uspješno rezervisan.
      </p>

      <div
  style={{
    borderTop: "1px solid #e5e5e5",
    borderBottom: "1px solid #e5e5e5",
    padding: "16px 0",
    textAlign: "left",
    marginBottom: "20px",
  }}
>
  <p>
    <strong style={{ color: "#611a1a" }}>Klijent:</strong> {ime} {prezime}
  </p>

  <p>
    <strong style={{ color: "#611a1a" }}>Salon:</strong> {salon}
  </p>

  <p>
    <strong style={{ color: "#611a1a" }}>Usluga:</strong> {service}
  </p>

  <p>
    <strong style={{ color: "#611a1a" }}>Datum:</strong> {formattedDate}
  </p>

  <p>
    <strong style={{ color: "#611a1a" }}>Vrijeme:</strong> {time}
  </p>
</div>

      {email && email.trim() && (
        <p style={{ color: "#611a1a", fontSize: "14px", marginBottom: "20px" }}>
          Potvrda rezervacije je poslana na email.
        </p>
      )}

      {salonSlug && (
        <button
          type="button"
          onClick={() => {
            window.location.href = `/${salonSlug}`;
          }}
          style={{
            width: "100%",
            backgroundColor: "#611a1a",
            color: "white",
            padding: "14px",
            borderRadius: "16px",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
        >
          Povratak na salon
        </button>
      )}
    </div>
  </main>
);
}