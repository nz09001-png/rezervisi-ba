"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function BookingContent() {
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const salon = searchParams.get("salon") || "Salon X";
  const time = searchParams.get("time") || "10:00";

  async function handleBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const customerName = formData.get("customer_name") as string;
    const phone = formData.get("phone") as string;

    const { error } = await supabase.from("bookings").insert({
      customer_name: customerName,
      phone: phone,
      salon: salon,
      booking_time: time,
    });

    if (error) {
      alert("Något gick fel. Försök igen.");
      console.error(error);
      setLoading(false);
      return;
    }

    setBooked(true);
    setLoading(false);
  }

  if (booked) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow text-center">
          <h1 className="text-3xl font-bold mb-4">Bokning genomförd!</h1>

          <p className="text-gray-600 mb-6">
            Din tid hos {salon} kl. {time} är nu bokad.
          </p>

          <a href="/" className="bg-black text-white px-6 py-3 rounded-lg">
            Tillbaka till startsidan
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-4">Boka tid</h1>

        <p className="text-gray-600 mb-6">
          {salon} – {time}
        </p>

        <form className="space-y-4" onSubmit={handleBooking}>
          <div>
            <label className="block mb-1 font-medium">Namn</label>
            <input
              name="customer_name"
              className="w-full border p-3 rounded-lg"
              type="text"
              placeholder="Ditt namn"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Telefonnummer</label>
            <input
              name="phone"
              className="w-full border p-3 rounded-lg"
              type="tel"
              placeholder="+387..."
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded-lg"
          >
            {loading ? "Bokar..." : "Bekräfta bokning"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function Booking() {
  return (
    <Suspense fallback={<div>Laddar...</div>}>
      <BookingContent />
    </Suspense>
  );
}