"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SalonZ() {
  const salonName = "Mostar Fade Studio";
  useEffect(() => {
  async function fetchSalonImage() {
    const { data, error } = await supabase
      .from("salons")
      .select("image_url")
      .eq("salon_name", salonName)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    if (data?.image_url) {
      setSalonImage(data.image_url);
    }
  }

  fetchSalonImage();
}, []);
const times = ["09:00", "10:00", "11:00"];

const [selectedDate, setSelectedDate] = useState("");
const [bookedTimes, setBookedTimes] = useState<string[]>([]);
const [salonImage, setSalonImage] = useState("");

const availableTimes = times.filter(
  (time) => !bookedTimes.includes(time)
);

useEffect(() => {
  async function fetchBookedTimes() {
    if (!selectedDate) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("booking_time")
      .eq("salon", salonName)
      .eq("booking_date", selectedDate);

    if (error) {
      console.error(error);
      return;
    }

    setBookedTimes(data.map((booking) => booking.booking_time));
  }

  fetchBookedTimes();
}, [selectedDate]);
  return (
    <main className="min-h-screen bg-[#f7f3ee]">
      <section
        className="h-72 bg-cover bg-center"
        style={{
  backgroundImage: `url(${
    salonImage ||
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80"
  })`,
}}
      ></section>

      <section className="mx-auto max-w-4xl px-8 py-10">
        <div className="rounded-3xl bg-white p-8 shadow">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Mostar
          </p>

          <h1 className="text-5xl font-bold mb-4">
            Mostar Fade Studio
          </h1>

          <p className="mb-6 text-gray-600">
            Premium fade šišanje, uređivanje brade i moderan barber stil.
          </p>

          <div className="mb-8 flex flex-wrap gap-4 text-sm text-gray-700">
            <div className="mb-8 grid gap-4 md:grid-cols-3">
  <div className="rounded-xl bg-gray-50 p-4">
    <p className="text-sm text-gray-500">Adresa</p>
    <p className="font-semibold">Braće Fejića 21, Mostar</p>
  </div>

  <div className="rounded-xl bg-gray-50 p-4">
    <p className="text-sm text-gray-500">Telefon</p>
    <p className="font-semibold">+387 63 444 555</p>
  </div>

  <div className="rounded-xl bg-gray-50 p-4">
    <p className="text-sm text-gray-500">Radno vrijeme</p>
    <p className="font-semibold">09:00 - 20:00</p>
  </div>
</div>
            <span>⭐ 4.9 (137 recenzije)</span>
            <span>📍 Mostar</span>
            <span>🕒 Otvoreno danas</span>
          </div>

          <h2 className="text-2xl font-bold mb-4">Usluge</h2>

          <div className="mb-8 space-y-3">
            <div className="flex justify-between rounded-xl bg-gray-50 p-4">
              <span>✂️ Muško šišanje</span>
              <strong>30 KM</strong>
            </div>

            <div className="flex justify-between rounded-xl bg-gray-50 p-4">
              <span>🧔 Trimovanje brade</span>
              <strong>15 KM</strong>
            </div>

            <div className="flex justify-between rounded-xl bg-gray-50 p-4">
              <span>👦 Dječije šišanje</span>
              <strong>20 KM</strong>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Slobodni termini</h2>
          <div className="mb-6">
  <label className="mb-2 block font-medium">Odaberite datum</label>

  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="w-full rounded-xl border p-3"
  />
</div>

          {selectedDate ? (
  <div className="grid grid-cols-3 gap-4">
    {availableTimes.map((time) => (
      <Link
        key={time}
        href={`/booking?salon=${encodeURIComponent(
          salonName
        )}&time=${time}&date=${selectedDate}`}
        className="rounded-xl bg-black p-4 text-center font-semibold text-white"
      >
        {time}
      </Link>
    ))}
  </div>
) : (
  <p className="text-gray-500">
    Odaberite datum da vidite slobodne termine.
  </p>
)}
        </div>
      </section>
    </main>
  );
}