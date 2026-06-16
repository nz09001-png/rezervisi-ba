"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SalonPage() {
  const params = useParams();
  const salonSlug = params.salonSlug as string;

  const [salon, setSalon] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [times, setTimes] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
const [loadingTimes, setLoadingTimes] = useState(false);
const [barbers, setBarbers] = useState<any[]>([]);
const [closedDays, setClosedDays] = useState<any[]>([])

  useEffect(() => {
    async function fetchSalon() {
      const { data, error } = await supabase
        .from("salons")
        .select("*")
        .eq("slug", salonSlug)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setSalon(data);
    }

    fetchSalon();
  }, [salonSlug]);

useEffect(() => {
  async function fetchServices() {
    if (!salon?.id) return;

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("salon_id", salon.id)
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setServices(data || []);
  }

  fetchServices();
}, [salon]);
useEffect(() => {
  async function fetchBarbers() {
    if (!salon?.id) return;

    const { data, error } = await supabase
      .from("barbers")
      .select("*")
      .eq("salon_id", salon.id)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setBarbers(data || []);
  }

  fetchBarbers();
}, [salon]);
useEffect(() => {
  async function fetchClosedDays() {
    if (!salon?.id) return;

    const { data, error } = await supabase
      .from("closed_days")
      .select("*")
      .eq("salon_id", salon.id);

    if (error) {
      console.error(error);
      return;
    }

    setClosedDays(data || []);
  }

  fetchClosedDays();
}, [salon]);
useEffect(() => {
  async function fetchTimes() {
    if (!salon?.id) return;

    const { data, error } = await supabase
      .from("available_times")
      .select("*")
      .eq("salon_id", salon.id)
      .order("time", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setTimes(data || []);
  }

  fetchTimes();
}, [salon]);

  useEffect(() => {
  async function fetchBookedTimes() {
    if (!selectedDate || !salon?.salon_name) {
      setBookedTimes([]);
      return;
    }

    setLoadingTimes(true);

    const { data, error } = await supabase
      .from("bookings")
      .select("booking_time")
      .eq("salon", salon.salon_name)
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
}, [selectedDate, salon]);
if (!salon) {
  return <h1>Laddar salong...</h1>;
}
const selectedClosedDay = closedDays.find(
  (day) => day.date === selectedDate
);

const availableTimes = times;

return (
  <main className="min-h-screen bg-[#f7f3ee]">
    <section
      className="h-72 bg-cover bg-center"
      style={{
        backgroundImage: `url(${
          salon.image_url ||
          "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80"
        })`,
      }}
    ></section>

    <section className="mx-auto max-w-4xl px-8 py-10">
      <div className="rounded-3xl bg-white p-8 shadow">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
          Sarajevo
        </p>

        <h1 className="mb-4 text-5xl font-bold">
          {salon.salon_name}
        </h1>

        <p className="mb-6 text-gray-600">
          {salon.description}
        </p>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Adresa</p>
            <p className="font-semibold">{salon.address}</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Telefon</p>
            <p className="font-semibold">{salon.phone}</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Radno vrijeme</p>
            <p className="font-semibold">{salon.opening_hours}</p>
          </div>
        </div>
        <div className="mb-8">
  <h2 className="mb-4 text-2xl font-bold">Lokacija</h2>

  <iframe
    src={`https://www.google.com/maps?q=${encodeURIComponent(
      salon.address || ""
    )}&output=embed`}
    width="100%"
    height="300"
    style={{ border: 0 }}
    loading="lazy"
    className="rounded-xl"
  />

  <a
    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      salon.address || ""
    )}`}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-4 inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white"
  >
    Otvori u Google Maps
    </a>
</div>

<h2 className="mb-4 text-2xl font-bold">Usluge</h2>

<div className="mb-8 space-y-3">
  {services.map((service) => (
  <div
    key={service.id}
    className="rounded-xl bg-gray-50 p-4"
  >
    <div className="flex justify-between">
      <div>
        <p>✂️ {service.name}</p>
        <p className="text-sm text-gray-500">
          Trajanje: {service.duration_minutes || 60} min
        </p>
      </div>

      <strong>{service.price} KM</strong>
    </div>

    <p className="mt-3 text-sm text-gray-600">
      Dostupni frizeri:{" "}
      {barbers.length > 0
        ? barbers.map((barber) => barber.name).join(", ")
        : "Nema dodanih frizera"}
    </p>
  </div>
))}
</div>
<h2 className="mb-4 text-2xl font-bold">Odaberi datum</h2>

<input
  type="date"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  className="mb-8 w-full rounded-xl border p-4"
/>
{selectedClosedDay && (
  <div className="mb-8 rounded-xl bg-red-100 p-4 text-red-700">
    <p className="font-semibold">
      Salon je zatvoren na odabrani datum.
    </p>

    <p>
      {selectedClosedDay.reason || "Nema navedenog razloga."}
    </p>
  </div>
)}
<h2 className="mb-4 text-2xl font-bold">Slobodni termini</h2>

{!selectedDate && (
  <p className="mb-4 text-gray-600">
    Prvo odaberi datum.
  </p>
)}

{selectedDate && !selectedClosedDay && (
  <div className="grid grid-cols-3 gap-4">
    {availableTimes.map((item) => (
      <Link
        key={item.id}
        href={`/booking?salon=${encodeURIComponent(
          salon.salon_name
        )}&time=${item.time}&date=${selectedDate}`}
        className="rounded-xl bg-black p-4 text-center font-semibold text-white"
      >
        {item.time}
      </Link>
    ))}
  </div>
)}

      </div>
    </section>
  </main>
);
}