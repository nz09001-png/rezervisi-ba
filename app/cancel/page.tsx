"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CancelPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const token = searchParams.get("token");

  const [cancelled, setCancelled] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!bookingId) {
      alert("Nedostaje ID rezervacije.");
      return;
    }

    const confirmCancel = confirm("Da li ste sigurni da želite otkazati rezervaciju?");

    if (!confirmCancel) return;

    setLoading(true);

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

    setCancelled(true);
    setLoading(false);
  }

  if (cancelled) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f7f3ee] p-8">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="mb-4 text-3xl font-bold">Rezervacija otkazana</h1>
          <p className="text-gray-600">Vaša rezervacija je uspješno otkazana.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f3ee] p-8">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <h1 className="mb-4 text-3xl font-bold">Otkaži rezervaciju</h1>

        <p className="mb-6 text-gray-600">
          Kliknite na dugme ispod da otkažete svoju rezervaciju.
        </p>

        <button
          onClick={handleCancel}
          disabled={loading}
          className="rounded bg-red-500 px-6 py-3 text-white disabled:bg-gray-400"
        >
          {loading ? "Otkazujem..." : "Otkaži rezervaciju"}
        </button>
      </div>
    </main>
  );
}