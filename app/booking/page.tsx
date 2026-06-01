"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Booking() {
  const [booked, setBooked] = useState(false);

  const searchParams = useSearchParams();
  const salon = searchParams.get("salon") || "Salon X";
  const time = searchParams.get("time") || "10:00";

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

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setBooked(true);
          }}
        >
          <div>
            <label className="block mb-1 font-medium">Namn</label>
            <input
              className="w-full border p-3 rounded-lg"
              type="text"
              placeholder="Ditt namn"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Telefonnummer</label>
            <input
              className="w-full border p-3 rounded-lg"
              type="tel"
              placeholder="+387..."
              required
            />
          </div>

          <button className="w-full bg-black text-white p-3 rounded-lg">
            Bekräfta bokning
          </button>
        </form>
      </div>
    </main>
  );
}