"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SalonX() {
  const [selectedDate, setSelectedDate] = useState("");
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [salonImage, setSalonImage] = useState("");
  const [salonInfo, setSalonInfo] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);

  const salonName = "Barber House Sarajevo";
  const [times, setTimes] = useState<any[]>([]);
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
      .eq("salon_id", 1)
      .order("id", { ascending: true });

    if (error) {
      console.error("SERVICES ERROR:", error);
      return;
    }

    console.log("SERVICES DATA:", data);
    setServices(data || []);
  }

  fetchServices();
}, []);
useEffect(() => {
  async function fetchTimes() {
    const { data, error } = await supabase
      .from("available_times")
      .select("*")
      .eq("salon_id", 1)
      .order("time", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setTimes(data || []);
  }

  fetchTimes();
}, []);

  useEffect(() => {
    async function fetchBookedTimes() {
      if (!selectedDate) {
        setBookedTimes([]);
        return;
      }

      setLoadingTimes(true);

      const { data, error } = await supabase
        .from("bookings")
        .select("booking_time")
        .eq("salon", salonName)
        .eq("booking_date", selectedDate);

      if (error) {
        console.error(error);
        setBookedTimes([]);
        setLoadingTimes(false);
        return;
      }

      setBookedTimes(data.map((booking) => booking.booking_time));
      setLoadingTimes(false);
    }

    fetchBookedTimes();
  }, [selectedDate]);

  const availableTimes = times.filter(
  (item) => !bookedTimes.includes(item.time)
);

  return (
    <main className="min-h-screen bg-[#f7f3ee]">
      <section
        className="h-72 bg-cover bg-center"
        style={{
  backgroundImage: `url(${salonImage || "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80"})`,
}}
      ></section>

      <section className="mx-auto max-w-4xl px-8 py-10">
        <div className="rounded-3xl bg-white p-8 shadow">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Sarajevo
          </p>

          <h1 className="text-5xl font-bold mb-4">
            Barber House Sarajevo
          </h1>

          <p className="mb-6 text-gray-600">
  {salonInfo?.description ||
    "Moderan frizerski salon za muško šišanje, bradu i dječije šišanje."}
</p>

          <div className="mb-8 flex flex-wrap gap-4 text-sm text-gray-700">
            <span>⭐ 4.9 (124 recenzije)</span>
            <span>📍 Sarajevo</span>
            <span>🕒 Otvoreno danas</span>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Adresa</p>
              <p className="font-semibold">
  {salonInfo?.address || "Ferhadija 12, Sarajevo"}
</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Telefon</p>
              <p className="font-semibold">
  {salonInfo?.phone || "+387 61 123 456"}
</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Radno vrijeme</p>
              <p className="font-semibold">
  {salonInfo?.opening_hours || "09:00 - 18:00"}
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

          <h2 className="text-2xl font-bold mb-4">Odaberi datum</h2>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mb-8 w-full rounded-xl border p-4"
          />

          <h2 className="text-2xl font-bold mb-4">Slobodni termini</h2>

          {!selectedDate && (
            <p className="text-gray-600">
              Prvo odaberi datum da vidite slobodne termine.
            </p>
          )}

          {selectedDate && loadingTimes && (
            <p className="text-gray-600">Učitavam slobodne termine...</p>
          )}

          {selectedDate && !loadingTimes && availableTimes.length === 0 && (
            <p className="text-gray-600">
              Nema slobodnih termina za ovaj datum.
            </p>
          )}

          {selectedDate && !loadingTimes && availableTimes.length > 0 && (
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
          )}
        </div>

        <h2 className="mt-10 mb-4 text-2xl font-bold">Recenzije</h2>

        <div className="space-y-4">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="font-semibold">Amar ⭐⭐⭐⭐⭐</p>
            <p className="text-gray-600">
              Odlična usluga i vrlo ljubazno osoblje.
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="font-semibold">Jasmin ⭐⭐⭐⭐⭐</p>
            <p className="text-gray-600">
              Najbolji fade u Sarajevu. Preporučujem.
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="font-semibold">Haris ⭐⭐⭐⭐</p>
            <p className="text-gray-600">
              Brza rezervacija i kvalitetno šišanje.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}