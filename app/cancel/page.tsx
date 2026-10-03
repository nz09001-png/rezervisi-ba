"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Outfit, Geist } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
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

  if (cancelled) {
    return (
      <main
  className="min-h-screen flex items-center justify-center p-4 md:p-8"
  style={{ backgroundColor: "#611a1a" }}
>
       <div
  className="max-w-md bg-white text-center"
  style={{
    width: "100%",
    padding: isMobile ? "22px" : "32px",
    borderRadius: "28px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
  }}
>
          <h1 className={`${outfit.className} mb-4 text-3xl font-bold`}>
  Rezervacija otkazana
</h1>

<p className={`${outfit.className} text-gray-600`}>
  Vaša rezervacija je uspješno otkazana.
</p>
        </div>
      </main>
    );
  }

  return (
    <main
  className="min-h-screen flex items-center justify-center p-8"
  style={{ backgroundColor: "#611a1a" }}
>
      <div
  className="max-w-md bg-white text-center"
  style={{
    width: "100%",
    padding: isMobile ? "22px" : "32px",
    borderRadius: "28px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
  }}
>
        <h1 className={`${outfit.className} mb-4 text-3xl font-bold`}>
  Otkaži rezervaciju
</h1>

{!(errorBox && !errorBox.canRetry) && (
<p className={`${outfit.className} mb-6 text-gray-600`}>
  {askConfirm
    ? "Da li ste sigurni da želite otkazati rezervaciju?"
    : "Kliknite na dugme ispod da otkažete svoju rezervaciju."}
</p>
)}

{errorBox && (
  <div
    className={`${outfit.className} rounded-2xl p-4`}
    style={{
      border: "2px solid #611a1a",
      backgroundColor: "#fff7f7",
      marginBottom: errorBox.canRetry ? "20px" : 0,
    }}
  >
    <p className="mb-1 font-bold" style={{ color: "#611a1a" }}>
      ⚠ {errorBox.title}
    </p>
    <p className="text-sm text-gray-700">{errorBox.text}</p>
  </div>
)}

{askConfirm ? (
  <div className="flex flex-wrap justify-center gap-3">
    <button
      onClick={handleCancel}
      disabled={loading}
      className={`${geist.className} rounded-2xl px-6 py-3 font-bold text-white disabled:opacity-50`}
      style={{
        backgroundColor: "#611a1a",
        color: "white",
      }}
    >
      {loading ? "Otkazujem..." : "Da, otkaži"}
    </button>

    <button
      onClick={() => setAskConfirm(false)}
      disabled={loading}
      className={`${geist.className} rounded-2xl px-6 py-3 font-bold disabled:opacity-50`}
      style={{
        backgroundColor: "white",
        color: "#611a1a",
        border: "1px solid #611a1a",
      }}
    >
      Ne
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
  className={`${geist.className} rounded-2xl px-6 py-3 font-bold text-white disabled:opacity-50`}
  style={{
    backgroundColor: "#611a1a",
    color: "white",
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