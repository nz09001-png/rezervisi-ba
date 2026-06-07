"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleLogin() {
  if (password.trim() === "barber123") {
    setIsLoggedIn(true);
  } else {
    alert("Pogrešna lozinka");
  }
}

  async function fetchBookings() {
    const { data, error } = await supabase
  .from("bookings")
  .select("*")
  .eq("salon", "Barber House Sarajevo")
  .order("created_at", { ascending: false });

    if (error) {
      setError(true);
      return;
    }

    setBookings(data || []);
  }

  async function handleDelete(id: number) {
    const confirmDelete = confirm("Da li ste sigurni da želite obrisati rezervaciju??");

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Nije moguće obrisati rezervaciju.");
      return;
    }

    fetchBookings();
  }

  useEffect(() => {
  if (isLoggedIn) {
    fetchBookings();
  }
}, [isLoggedIn]);


const today = new Date().toISOString().split("T")[0];
const currentDate = new Date();

const startOfWeek = new Date(currentDate);
startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);

const startOfMonth = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  1
);

const filteredBookings = bookings.filter((booking) => {
  const bookingDate = new Date(booking.booking_date);
  const matchesSalon = booking.salon === "Barber House Sarajevo";

  if (!matchesSalon) return false;

  if (selectedDate) {
    return booking.booking_date === selectedDate;
  }

  if (filter === "today") {
    return booking.booking_date === today;
  }

  if (filter === "week") {
    return bookingDate >= startOfWeek;
  }

  if (filter === "month") {
    return bookingDate >= startOfMonth;
  }

  return true;
});

const todaysBookings = bookings.filter(
  (booking) => booking.booking_date === today
);

if (!isLoggedIn) {
  return (
      <main className="min-h-screen flex items-center justify-center bg-[#f7f3ee]">
        <div className="bg-white p-8 rounded-2xl shadow w-96">
          <h1 className="text-2xl font-bold mb-4">Admin prijava</h1>

          <form
  onSubmit={(e) => {
    e.preventDefault();
    handleLogin();
  }}
>
  <input
    type="password"
    placeholder="Lozinka"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full border p-2 rounded mb-4"
  />

  <button
    type="submit"
    className="w-full bg-black text-white p-2 rounded"
  >
    Prijavite se
  </button>
</form>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="mt-4 text-red-600">Nije moguće učitati rezervacije.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
  <h1 className="text-4xl font-bold">
  Salon X Admin ({filteredBookings.length})
</h1>
  

  <button
    onClick={() => setIsLoggedIn(false)}
    className="rounded bg-black px-4 py-2 text-white"
  >
    Odjavi se
  </button>
</div>
<div className="mb-6 grid grid-cols-2 gap-4">
  <div className="rounded-2xl bg-white p-4 shadow">
    <p className="text-sm text-gray-500">Današnje rezervacije</p>
    <p className="text-3xl font-bold">{todaysBookings.length}</p>
  </div>

  <div className="rounded-2xl bg-white p-4 shadow">
    <p className="text-sm text-gray-500">Ukupno rezervacija</p>
    <p className="text-3xl font-bold">{filteredBookings.length}</p>
  </div>
</div>

  <div className="mb-6 flex flex-wrap gap-2">
  <button
    onClick={() => setFilter("today")}
    className={`rounded px-4 py-2 text-white ${
      filter === "today" ? "bg-black" : "bg-gray-500"
    }`}
  >
    Danas
  </button>

  <button
    onClick={() => setFilter("week")}
    className={`rounded px-4 py-2 text-white ${
      filter === "week" ? "bg-black" : "bg-gray-500"
    }`}
  >
    Ova sedmica
  </button>

  <button
    onClick={() => setFilter("month")}
    className={`rounded px-4 py-2 text-white ${
      filter === "month" ? "bg-black" : "bg-gray-500"
    }`}
  >
    Ovaj mjesec
  </button>

  <button
    onClick={() => setFilter("all")}
    className={`rounded px-4 py-2 text-white ${
      filter === "all" ? "bg-black" : "bg-gray-500"
    }`}
  >
    Sve
  </button>
</div>
<div className="mb-6 rounded-2xl bg-white p-4 shadow">
  <label className="mb-2 block font-medium">Profilna slika</label>

  <input
  
    type="file"
    accept="image/*"
    onChange={(e) => {
      if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
      }
    }}
    className="block"
  />
  <button className="mt-4 rounded bg-black px-4 py-2 text-white">
  Sačuvaj sliku
</button>
</div>

  

<div className="mb-6 rounded-2xl bg-white p-4 shadow">
  <label className="mb-2 block font-medium">Odaberite datum</label>

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
          Obriši
        </button>
      </div>

      <div className="space-y-1">
        <p>
          <strong>Ime i prezime:</strong> {booking.customer_name}
        </p>
        <p>
          <strong>Telefon:</strong> {booking.phone}
        </p>
        <p>
          <strong>Salon:</strong> {booking.salon}
        </p>
      </div>
    </div>
  ))}
</div>
      </div>
    </main>
  );
}