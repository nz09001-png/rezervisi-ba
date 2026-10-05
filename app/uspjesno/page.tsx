"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Source_Sans_3, Geist, Montserrat } from "next/font/google";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
});

const geist = Geist({
  subsets: ["latin"],
});

// Rubrik och salongens namn – samma som Potvrda.
const montserrat = Montserrat({
  weight: ["600", "700"],
  subsets: ["latin", "latin-ext"],
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

// Datum som "Sri, 07.10.2026".
const formattedDate = date
  ? (() => {
      const [y, m, d] = date.split("-").map(Number);
      const shortDays = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];
      const weekday = shortDays[new Date(y, m - 1, d).getDay()];
      return `${weekday}, ${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
    })()
  : "";

// Tid som "09:30 – 10:00". Har salongen dolt längden visas bara starttiden.
const displayTime = (() => {
  if (!time) return "";
  if (!showDuration || !duration) return time;
  const [h, min] = time.split(":").map(Number);
  const end = h * 60 + min + Number(duration);
  return `${time} – ${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
})();

const rows: [string, string][] = [
  ["Datum", formattedDate],
  ["Vrijeme", displayTime],
  ["Osoblje", barber || ""],
  ...(showPrice && price ? ([["Cijena", `${price} KM`]] as [string, string][]) : []),
  ["Klijent", `${ime || ""} ${prezime || ""}`.trim()],
];

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
        borderRadius: "24px",
        padding: isMobile ? "24px 20px" : "28px 24px",
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
  className={montserrat.className}
  style={{
    color: "#611a1a",
    fontSize: isMobile ? "24px" : "26px",
    fontWeight: 700,
    letterSpacing: "-0.3px",
    marginBottom: "6px",
  }}
>
  Rezervacija potvrđena
</h1>

      <p
  className={sourceSans.className}
  style={{
    color: "#6b7280",
    fontSize: "16px",
    marginBottom: "18px",
  }}
>
  Vaš termin je uspješno rezervisan.
</p>

      {/* Bokningen som rader – samma stil som Potvrda. */}
      <div className={sourceSans.className} style={{ textAlign: "left", marginBottom: "16px" }}>
        {salon && (
          <p
            className={montserrat.className}
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#611a1a",
            }}
          >
            {salon}
          </p>
        )}

        <p style={{ margin: "2px 0 6px", fontSize: "19px", fontWeight: 700, color: "#111827" }}>
          {service}
        </p>

        {rows.map(([label, value], index) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              padding: "10px 0",
              borderTop: index === 0 ? "1px solid #f1e4e4" : "1px solid #f1e4e4",
              fontSize: "16px",
            }}
          >
            <span style={{ color: "#6b7280" }}>{label}</span>
            <span style={{ fontWeight: 600, color: "#111827", textAlign: "right" }}>{value}</span>
          </div>
        ))}
      </div>

      {email && email.trim() && (
  <p
    className={sourceSans.className}
    style={{
      color: "#6b7280",
      fontSize: "14px",
      marginBottom: "16px",
    }}
  >
    Potvrda rezervacije je poslana na email.
  </p>
)}

      {/* Utan e-post finns ingen avbokningslänk – berätta hur man avbokar. */}
      {!email?.trim() && (
  <p
    className={sourceSans.className}
    style={{
      color: "#6b7280",
      fontSize: "14px",
      marginBottom: "16px",
    }}
  >
    Za otkazivanje termina kontaktirajte salon.
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
    width: "100%",
    height: "48px",
    backgroundColor: "#611a1a",
    color: "white",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "16px",
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