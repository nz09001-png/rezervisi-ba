"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SalonY() {
  const salonName = "Gentlemen Tuzla";
const [times, setTimes] = useState<any[]>([]);

const [selectedDate, setSelectedDate] = useState("");
const [bookedTimes, setBookedTimes] = useState<string[]>([]);
const [salonImage, setSalonImage] = useState("");
const [salonInfo, setSalonInfo] = useState<any>(null);
const [services, setServices] = useState<any[]>([]);
useEffect(() => {
  async function fetchSalonImage() {
    const { data, error } = await supabase
      .from("salons")
      .select("image_url, description, phone, address, opening_hours")
      .eq("salon_name", salonName)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    if (data?.image_url) {
      setSalonImage(data.image_url);
    }
    setSalonInfo(data);
  }

  fetchSalonImage();
}, []);
useEffect(() => {
  async function fetchServices() {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("salon_id", 2)
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setServices(data || []);
  }

  fetchServices();
}, []);
useEffect(() => {
  async function fetchTimes() {
    const { data, error } = await supabase
      .from("available_times")
      .select("*")
      .eq("salon_id", 2)
      .order("time", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setTimes(data || []);
  }

  fetchTimes();
}, []);

const availableTimes = times.filter(
  (item) => !bookedTimes.includes(item.time)
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
      "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1200&q=80"
    })`,
  }}
></section>

      <section className="mx-auto max-w-4xl px-8 py-10">
        <div className="rounded-3xl bg-white p-8 shadow">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Tuzla
          </p>

          <h1 className="text-5xl font-bold mb-4">
            Gentlemen Tuzla
          </h1>

          <p className="mb-6 text-gray-600">
  {salonInfo?.description ||
    "Klasično i moderno šišanje za muškarce, bradu i stilizovanje."}
</p>

          <div className="mb-8 flex flex-wrap gap-4 text-sm text-gray-700">
            <div className="mb-8 grid gap-4 md:grid-cols-3">
  <div className="rounded-xl bg-gray-50 p-4">
  <p className="text-sm text-gray-500">Adresa</p>
  <p className="font-semibold">
    {salonInfo?.address || "Korzo 8, Tuzla"}
  </p>
</div>

<div className="rounded-xl bg-gray-50 p-4">
  <p className="text-sm text-gray-500">Telefon</p>
  <p className="font-semibold">
    {salonInfo?.phone || "+387 62 222 333"}
  </p>
</div>

<div className="rounded-xl bg-gray-50 p-4">
  <p className="text-sm text-gray-500">Radno vrijeme</p>
  <p className="font-semibold">
    {salonInfo?.opening_hours || "10:00 - 19:00"}
  </p>
</div>
<div className="mb-8">
  <h2 className="mb-4 text-2xl font-bold">Lokacija</h2>

  <iframe
    src={`https://www.google.com/maps?q=${encodeURIComponent(
      salonInfo?.address || ""
    )}&output=embed`}
    width="100%"
    height="300"
    style={{ border: 0 }}
    loading="lazy"
    className="rounded-xl"
  />

  <a
    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      salonInfo?.address || ""
    )}`}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-4 inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white"
  >
    Otvori u Google Maps
  </a>
</div>
</div> 
            <span>⭐ 4.8 (98 recenzije)</span>
            <span>📍 Tuzla</span>
            <span>🕒 Otvoreno danas</span>
          </div>

          <h2 className="text-2xl font-bold mb-4">Usluge</h2>

          <div className="mb-8 space-y-3">
  {services.map((service) => (
  <div
    key={service.id}
    className="flex justify-between rounded-xl bg-gray-50 p-4"
  >
    <div>
      <p>✂️ {service.name}</p>
      <p className="text-sm text-gray-500">
        Trajanje: {service.duration_minutes || 60} min
      </p>
    </div>

    <strong>{service.price} KM</strong>
  </div>
))}
</div>

          <h2 className="text-2xl font-bold mb-4">Slobodni termini</h2>
          <div className="mb-6">
  <label className="mb-2 block font-medium">Välj datum</label>

  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="w-full rounded-xl border p-3"
  />
</div>

          {selectedDate ? (
  <div className="grid grid-cols-3 gap-4">
    {availableTimes.map((item) => (
  <Link
    key={item.id}
    href={`/booking?salon=${encodeURIComponent(
      salonName
    )}&time=${item.time}&date=${selectedDate}`}
        className="rounded-xl bg-black p-4 text-center font-semibold text-white"
      >
        {item.time}
      </Link>
    ))}
  </div>
) : (
  <p className="text-gray-500">
    Prvo odaberi datum da vidite slobodne termine.
  </p>
)}
        </div>
      </section>
    </main>
  );
}