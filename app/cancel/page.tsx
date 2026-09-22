"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CancelPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const token = searchParams.get("token");

  const [cancelled, setCancelled] = useState(false);
  const [loading, setLoading] = useState(false);
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

  async function handleCancel() {
    if (!bookingId) {
      alert("Nedostaje ID rezervacije.");
      return;
    }

    const confirmCancel = confirm("Da li ste sigurni da želite otkazati rezervaciju?");

    if (!confirmCancel) return;

    setLoading(true);

    const { data: bookingData, error: bookingError } = await supabase
  .from("bookings")
  .select("*")
  .eq("id", bookingId)
  .eq("cancel_token", token)
  .single();

if (bookingError || !bookingData) {
  alert("Rezervacija nije pronađena ili link za otkazivanje nije važeći.");
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
      alert("Greška pri otkazivanju rezervacije.");
      console.error(error);
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
  message: `${bookingData.customer_name} je otkazao/la termin ${formattedBookingDate}. u ${bookingData.booking_time} kod ${bookingData.barber_name}`,
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
          <h1 className="mb-4 text-3xl font-bold">Rezervacija otkazana</h1>
          <p className="text-gray-600">Vaša rezervacija je uspješno otkazana.</p>
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
        <h1 className="mb-4 text-3xl font-bold">Otkaži rezervaciju</h1>

        <p className="mb-6 text-gray-600">
          Kliknite na dugme ispod da otkažete svoju rezervaciju.
        </p>

        <button
  onClick={handleCancel}
  disabled={loading}
  className="rounded px-6 py-3 text-white disabled:opacity-50"
  style={{
    backgroundColor: "#611a1a",
    color: "white",
  }}
>
          {loading ? "Otkazujem..." : "Otkaži rezervaciju"}
        </button>
      </div>
    </main>
  );
}