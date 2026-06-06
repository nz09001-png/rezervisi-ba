"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  function handleLogin() {
  if (password.trim() === "admin123") {
    setIsLoggedIn(true);
  } else {
    alert("Fel lösenord");
  }
}

  async function fetchBookings() {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(true);
      return;
    }

    setBookings(data || []);
  }

  async function handleDelete(id: number) {
    const confirmDelete = confirm("Är du säker på att du vill radera bokningen?");

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Kunde inte radera bokningen.");
      return;
    }

    fetchBookings();
  }

  useEffect(() => {
  if (isLoggedIn) {
    fetchBookings();
  }
}, [isLoggedIn]);

const filteredBookings = selectedDate
  ? bookings.filter((booking) => booking.booking_date === selectedDate)
  : bookings;

if (!isLoggedIn) {
  return (
      <main className="min-h-screen flex items-center justify-center bg-[#f7f3ee]">
        <div className="bg-white p-8 rounded-2xl shadow w-96">
          <h1 className="text-2xl font-bold mb-4">Admin prijava</h1>

          <input
            type="password"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-black text-white p-2 rounded"
          >
            Logga in
          </button>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="mt-4 text-red-600">Kunde inte hämta bokningar.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
  <h1 className="text-4xl font-bold">
  Bokningar ({filteredBookings.length})
</h1>

  <button
    onClick={() => setIsLoggedIn(false)}
    className="rounded bg-black px-4 py-2 text-white"
  >
    Logga ut
  </button>
</div>
<div className="mb-6 rounded-2xl bg-white p-4 shadow">
  <label className="mb-2 block font-medium">Välj datum</label>

  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="rounded border p-3"
  />
</div>
        <div className="grid gap-4">
  {filteredBookings.map((booking) => (
    <div
      key={booking.id}
      className="rounded-2xl bg-white p-5 shadow"
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{booking.booking_time}</p>
          <p className="text-sm text-gray-500">{booking.booking_date}</p>
        </div>

        <button
          onClick={() => handleDelete(booking.id)}
          className="rounded bg-red-500 px-3 py-1 text-white"
        >
          Radera
        </button>
      </div>

      <div className="space-y-1">
        <p>
          <strong>Namn:</strong> {booking.customer_name}
        </p>
        <p>
          <strong>Telefon:</strong> {booking.phone}
        </p>
        <p>
          <strong>Salong:</strong> {booking.salon}
        </p>
      </div>
    </div>
  ))}
</div>
      </div>
    </main>
  );
}