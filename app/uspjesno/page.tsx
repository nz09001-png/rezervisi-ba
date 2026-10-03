"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Outfit, Source_Sans_3, Geist } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
});

const geist = Geist({
  subsets: ["latin"],
});

export default function UspjesnoPage() {
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);

 useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  checkMobile();
  window.addEventListener("resize", checkMobile);

  return () => {
    window.removeEventListener("resize", checkMobile);
  };
}, []);
 
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
  const barber = searchParams.get("barber");
  const price = searchParams.get("price");
const duration = searchParams.get("duration");
const showPrice = searchParams.get("showPrice") === "true";
const showDuration = searchParams.get("showDuration") === "true";
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const email = searchParams.get("email");
  const ime = searchParams.get("ime");
const prezime = searchParams.get("prezime");

const formattedDate = date
  ? `${date.split("-")[2]}.${date.split("-")[1]}.${date.split("-")[0]}`
  : "";

  return (
  <main
  style={{
    minHeight: isMobile ? "100dvh" : "100vh",
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
        padding: isMobile ? "22px" : "28px",
        textAlign: "center",
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
      }}
    >
      <div
  style={{
    width: isMobile ? "50px" : "56px",
    height: isMobile ? "50px" : "56px",
    borderRadius: "999px",
    backgroundColor: "#611a1a",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: isMobile ? "24px" : "28px",
    fontWeight: "bold",
    margin: isMobile ? "0 auto 12px" : "0 auto 16px",
  }}
>
  ✓
</div>

      <h1
  className={outfit.className}
  style={{
    color: "#611a1a",
    fontSize: isMobile ? "24px" : "28px",
    fontWeight: "700",
    marginBottom: "8px",
  }}
>
  Rezervacija potvrđena
</h1>

      <p
  className={outfit.className}
  style={{
    color: "#666",
    fontSize: "14px",
    marginBottom: "20px",
  }}
>
  Vaš termin je uspješno rezervisan.
</p>

      <div
  className={sourceSans.className}
  style={{
    borderTop: "1px solid #e5e5e5",
    borderBottom: "1px solid #e5e5e5",
    padding: isMobile ? "12px 0" : "16px 0",
    textAlign: "left",
    marginBottom: "20px",
  }}
>
  <p style={{ marginBottom: isMobile ? "2px" : "0" }}>
  <strong style={{ color: "#611a1a" }}>Klijent:</strong> {ime} {prezime}
</p>

  <p style={{ marginBottom: isMobile ? "2px" : "0" }}>
    <strong style={{ color: "#611a1a" }}>Salon:</strong> {salon}
  </p>

  <p style={{ marginBottom: isMobile ? "2px" : "0" }}>
  <strong style={{ color: "#611a1a" }}>Usluga:</strong> {service}
</p>

<p style={{ marginBottom: isMobile ? "2px" : "0" }}>
  <strong style={{ color: "#611a1a" }}>Osoblje:</strong> {barber}
</p>

{showPrice && (
  <p style={{ marginBottom: isMobile ? "2px" : "0" }}>
    <strong style={{ color: "#611a1a" }}>Cijena:</strong> {price} KM
  </p>
)}

{showDuration && (
  <p style={{ marginBottom: isMobile ? "2px" : "0" }}>
    <strong style={{ color: "#611a1a" }}>Trajanje:</strong> {duration} min
  </p>
)}

<p style={{ marginBottom: isMobile ? "2px" : "0" }}>
  <strong style={{ color: "#611a1a" }}>Datum:</strong> {formattedDate}
</p>

  <p style={{ marginBottom: isMobile ? "2px" : "0" }}>
    <strong style={{ color: "#611a1a" }}>Vrijeme:</strong> {time}
  </p>
</div>

      {email && email.trim() && (
  <p
    className={outfit.className}
    style={{
      color: "#611a1a",
      fontSize: "14px",
      marginBottom: isMobile ? "14px" : "20px",
    }}
  >
    Potvrda rezervacije je poslana na email.
  </p>
)}

      {salonSlug && (
        <button
  type="button"
  className={geist.className}
  onClick={() => {
    window.location.href = `/${salonSlug}`;
  }}
  style={{
    width: isMobile ? "82%" : "100%",
    backgroundColor: "#611a1a",
    color: "white",
    padding: isMobile ? "12px" : "14px",
    borderRadius: "16px",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
    margin: isMobile ? "0 auto" : undefined,
    display: isMobile ? "block" : undefined,
  }}
>
  Povratak na salon
</button>
      )}
    </div>
  </main>
);
}