"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Source_Sans_3, Geist, Montserrat } from "next/font/google";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
});

// Rubriker – samma som resten av bokningsflödet.
const montserrat = Montserrat({
  weight: ["600", "700"],
  subsets: ["latin", "latin-ext"],
});

const geist = Geist({
  subsets: ["latin"],
});

export default function CancelPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const token = searchParams.get("token");

  const [cancelled, setCancelled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Frågan "Da li ste sigurni...?" visas i kortet i stället för en grå confirm-ruta.
  const [askConfirm, setAskConfirm] = useState(false);
  // Fel visas i en vinröd ruta i kortet. canRetry = tekniskt fel, går att försöka igen.
  const [errorBox, setErrorBox] = useState<{
    title: string;
    text: string;
    canRetry: boolean;
  } | null>(null);

  const showNotFound = () =>
    setErrorBox({
      title: "Rezervacija nije pronađena",
      text: "Rezervacija je možda već otkazana ili link nije važeći.",
      canRetry: false,
    });

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

  async function handleCancel() {
    setErrorBox(null);

    if (!bookingId) {
      setAskConfirm(false);
      showNotFound();
      return;
    }

    setLoading(true);

    const { data: bookingData, error: bookingError } = await supabase
  .from("bookings")
  .select("*")
  .eq("id", bookingId)
  .eq("cancel_token", token)
  .single();

if (bookingError || !bookingData) {
  setAskConfirm(false);
  showNotFound();
  setLoading(false);
  return;
}

  const { data: salonData } = await supabase
  .from("salons")
  .select("id")
  .eq("salon_name", bookingData?.salon)
  .single();
    
    const { error } = await supabase
  .from("bookings")
  .delete()
  .eq("id", bookingId)
  .eq("cancel_token", token);

    if (error) {
      console.error(error);
      setAskConfirm(false);
      setErrorBox({
        title: "Došlo je do greške",
        text: "Rezervacija nije otkazana. Molimo pokušajte ponovo.",
        canRetry: true,
      });
      setLoading(false);
      return;
    }

   if (salonData?.id && bookingData) {
  const formattedBookingDate = bookingData.booking_date
    .split("-")
    .reverse()
    .join(".");

  await supabase.from("admin_notifications").insert({
  salon_id: salonData.id,
  type: "booking_cancelled",
  title: "Otkazana rezervacija",
  // Rad 1: kundens namn. Rad 2: datum, tid och personal (admin visar raderna snyggt).
  message: `${bookingData.customer_name}\n${formattedBookingDate} u ${String(bookingData.booking_time).slice(0, 5)} · ${bookingData.barber_name || "Bez preferencije"}`,
  event_date: bookingData.booking_date,
  event_time: bookingData.booking_time,
  is_read: false,
});
}

    setCancelled(true);
    setLoading(false);
  }

  // Gemensam stil för kortet (vinröd bakgrund, vitt kort i mitten).
  const pageStyle = {
    minHeight: isMobile ? "100dvh" : "100vh",
    backgroundColor: "#611a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: isMobile ? "26px 20px" : "30px 26px",
    textAlign: "center" as const,
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
  };

  const titleStyle = {
    margin: 0,
    fontSize: isMobile ? "24px" : "26px",
    fontWeight: 700,
    letterSpacing: "-0.3px",
    color: "#111827",
  };

  const textStyle = {
    margin: "8px 0 0",
    fontSize: "16px",
    lineHeight: 1.5,
    color: "#6b7280",
  };

  const buttonBase = {
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    fontWeight: 700,
    fontSize: "16px",
    cursor: "pointer",
  };

  if (cancelled) {
    return (
      <main className={sourceSans.className} style={pageStyle}>
        <div style={cardStyle}>
          {/* Grå bock – bokningen gäller inte längre. */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "9999px",
              backgroundColor: "#f3f4f6",
              color: "#6b7280",
              fontSize: "26px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            ✓
          </div>

          <h1 className={montserrat.className} style={titleStyle}>
            Rezervacija otkazana
          </h1>

          <p style={textStyle}>Vaša rezervacija je uspješno otkazana.</p>

          <Link
            href="/"
            className={geist.className}
            style={{
              ...buttonBase,
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ffffff",
              color: "#611a1a",
              border: "1px solid #611a1a",
              textDecoration: "none",
            }}
          >
            Rezervišite novi termin
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={sourceSans.className} style={pageStyle}>
      <div style={cardStyle}>
        <h1 className={montserrat.className} style={titleStyle}>
          Otkaži rezervaciju
        </h1>

{!(errorBox && !errorBox.canRetry) && (
<p style={textStyle}>
  {askConfirm
    ? "Da li ste sigurni da želite otkazati rezervaciju?"
    : "Kliknite na dugme ispod da otkažete svoju rezervaciju."}
</p>
)}

{errorBox && (
  <div
    className="rounded-2xl p-4"
    style={{
      border: "2px solid #611a1a",
      backgroundColor: "#fff7f7",
      marginTop: "16px",
    }}
  >
    <p className="mb-1 font-bold" style={{ color: "#611a1a" }}>
      ⚠ {errorBox.title}
    </p>
    <p className="text-sm text-gray-700">{errorBox.text}</p>
  </div>
)}

{askConfirm ? (
  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
    <button
      onClick={handleCancel}
      disabled={loading}
      className={geist.className}
      style={{
        ...buttonBase,
        backgroundColor: "#ef4444",
        color: "#ffffff",
        border: "none",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? "Otkazujem..." : "Da, otkaži"}
    </button>

    <button
      onClick={() => setAskConfirm(false)}
      disabled={loading}
      className={geist.className}
      style={{
        ...buttonBase,
        backgroundColor: "#ffffff",
        color: "#611a1a",
        border: "1px solid #611a1a",
        opacity: loading ? 0.6 : 1,
      }}
    >
      Ne, zadrži rezervaciju
    </button>
  </div>
) : (
  (!errorBox || errorBox.canRetry) && (
        <button
  onClick={() => {
    setErrorBox(null);
    setAskConfirm(true);
  }}
  disabled={loading}
  className={geist.className}
  style={{
    ...buttonBase,
    marginTop: "20px",
    backgroundColor: "#ffffff",
    color: "#ef4444",
    border: "1px solid #ef4444",
  }}
>
          Otkaži rezervaciju
        </button>
  )
)}
      </div>
    </main>
  );
}