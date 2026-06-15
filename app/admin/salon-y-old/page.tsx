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
  const [description, setDescription] = useState("");
const [phone, setPhone] = useState("");
const [address, setAddress] = useState("");
const [openingHours, setOpeningHours] = useState("");
const [services, setServices] = useState<any[]>([]);
const [serviceName, setServiceName] = useState("");
const [servicePrice, setServicePrice] = useState("");
const [serviceDuration, setServiceDuration] = useState("60");
const [times, setTimes] = useState<any[]>([]);
const [newTime, setNewTime] = useState("");

  function handleLogin() {
    if (password.trim() === "tuzla123") {
      setIsLoggedIn(true);
    } else {
      alert("Pogrešna lozinka");
    }
  }

  async function fetchBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("salon", "Gentlemen Tuzla")
    .order("created_at", { ascending: false });

  if (error) {
    setError(true);
    return;
  }

  setBookings(data || []);
}

async function fetchSalonInfo() {
  const { data, error } = await supabase
    .from("salons")
    .select("description, phone, address, opening_hours")
    .eq("id", 2)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  setDescription(data.description || "");
  setPhone(data.phone || "");
  setAddress(data.address || "");
  setOpeningHours(data.opening_hours || "");
}

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
async function handleAddTime() {
  if (!newTime.trim()) {
    alert("Unesite vrijeme.");
    return;
  }

  const { error } = await supabase.from("available_times").insert({
    salon_id: 2,
    time: newTime,
  });

  if (error) {
    alert("Greška pri dodavanju vremena.");
    console.error(error);
    return;
  }

  setNewTime("");
  fetchTimes();
}
async function handleDeleteTime(id: number) {
  const confirmDelete = confirm("Da li ste sigurni da želite obrisati vrijeme?");

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("available_times")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Greška pri brisanju vremena.");
    console.error(error);
    return;
  }

  fetchTimes();
}

async function handleAddService() {
  if (!serviceName.trim() || !servicePrice.trim() || !serviceDuration.trim()) {
  alert("Unesite naziv, cijenu i trajanje usluge.");
  return;
}

  const { error } = await supabase.from("services").insert({
  salon_id: 2,
  name: serviceName,
  price: servicePrice,
  duration_minutes: Number(serviceDuration),
});

  if (error) {
    alert("Greška pri dodavanju usluge.");
    console.error(error);
    return;
  }

  setServiceName("");
setServicePrice("");
setServiceDuration("60");
fetchServices();
}

async function handleDeleteService(id: number) {
  const confirmDelete = confirm("Da li ste sigurni da želite obrisati uslugu?");

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Greška pri brisanju usluge.");
    console.error(error);
    return;
  }

  fetchServices();
}

  async function handleDelete(id: number) {
    const confirmDelete = confirm(
      "Da li ste sigurni da želite obrisati rezervaciju?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase.from("bookings").delete().eq("id", id);

    if (error) {
      alert("Nije moguće obrisati rezervaciju.");
      return;
    }

    fetchBookings();
  }
async function handleImageUpload() {
  if (!selectedFile) {
    alert("Prvo odaberite sliku.");
    return;
  }

  const fileName = `salon-y-${Date.now()}-${selectedFile.name}`;

  const { error: uploadError } = await supabase.storage
    .from("salon-images")
    .upload(fileName, selectedFile);

  if (uploadError) {
    alert("Greška pri učitavanju slike.");
    console.error(uploadError);
    return;
  }

  const { data } = supabase.storage
    .from("salon-images")
    .getPublicUrl(fileName);

  const imageUrl = data.publicUrl;

  const { error: updateError } = await supabase
    .from("salons")
    .update({ image_url: imageUrl })
    .eq("id", 2);

  if (updateError) {
    alert("Slika je učitana, ali nije spremljena u profil.");
    console.error(updateError);
    return;
  }

  alert("Slika je uspješno spremljena.");
  setSelectedFile(null);
}
async function handleSalonInfoUpdate() {
  const { error } = await supabase
    .from("salons")
    .update({
      description: description,
      phone: phone,
      address: address,
      opening_hours: openingHours,
    })
    .eq("id", 2);

  if (error) {
    alert("Greška pri spremanju podataka.");
    console.error(error);
    return;
  }

  alert("Podaci su uspješno spremljeni.");
}

  useEffect(() => {
  if (isLoggedIn) {
    fetchBookings();
    fetchSalonInfo();
    fetchServices();
    fetchTimes();
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
            Gentlemen Tuzla Admin ({filteredBookings.length})
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

  <button
    onClick={handleImageUpload}
    className="mt-4 rounded bg-black px-4 py-2 text-white"
  >
    Sačuvaj sliku
  </button>
</div>

<div className="mb-6 rounded-2xl bg-white p-4 shadow">
  <h2 className="mb-4 text-xl font-bold">Informacije o salonu</h2>

  <label className="mb-2 block font-medium">Opis</label>
  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className="mb-4 w-full rounded border p-3"
    rows={3}
  />

  <label className="mb-2 block font-medium">Telefon</label>
  <input
    type="text"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    className="mb-4 w-full rounded border p-3"
  />

  <label className="mb-2 block font-medium">Adresa</label>
  <input
    type="text"
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    className="mb-4 w-full rounded border p-3"
  />

  <label className="mb-2 block font-medium">Radno vrijeme</label>
  <input
    type="text"
    value={openingHours}
    onChange={(e) => setOpeningHours(e.target.value)}
    className="mb-4 w-full rounded border p-3"
  />

  <button
    onClick={handleSalonInfoUpdate}
    className="rounded bg-black px-4 py-2 text-white"
  >
    Sačuvaj informacije
  </button>
</div>
<div className="mb-6 rounded-2xl bg-white p-4 shadow">
  <h2 className="mb-4 text-xl font-bold">Usluge</h2>

  <div className="mb-4 space-y-2">
    {services.map((service) => (
      <div
        key={service.id}
        className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
      >
        <div>
  <p>{service.name}</p>
  <p className="font-bold">{service.price} KM</p>
  <p className="text-sm text-gray-500">
    Trajanje: {service.duration_minutes || 60} min
  </p>
</div>

        <button
          onClick={() => handleDeleteService(service.id)}
          className="rounded bg-red-500 px-3 py-1 text-white"
        >
          Obriši
        </button>
      </div>
    ))}
  </div>

  <input
    type="text"
    placeholder="Naziv usluge"
    value={serviceName}
    onChange={(e) => setServiceName(e.target.value)}
    className="mb-3 w-full rounded border p-3"
  />

  <input
    type="text"
    placeholder="Cijena"
    value={servicePrice}
    onChange={(e) => setServicePrice(e.target.value)}
    className="mb-3 w-full rounded border p-3"
  />
  <input
  type="number"
  placeholder="Trajanje u minutama, npr. 30"
  value={serviceDuration}
  onChange={(e) => setServiceDuration(e.target.value)}
  className="mb-3 w-full rounded border p-3"
/>

  <button
    onClick={handleAddService}
    className="rounded bg-black px-4 py-2 text-white"
  >
    + Dodaj uslugu
  </button>
</div>
<div className="mb-6 rounded-2xl bg-white p-4 shadow">
  <h2 className="mb-4 text-xl font-bold">Termini</h2>

  <div className="mb-4 space-y-2">
    {times.map((item) => (
      <div
        key={item.id}
        className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
      >
        <span>{item.time}</span>

        <button
          onClick={() => handleDeleteTime(item.id)}
          className="rounded bg-red-500 px-3 py-1 text-white"
        >
          Obriši
        </button>
      </div>
    ))}
  </div>

  <input
    type="text"
    placeholder="Vrijeme, npr. 09:30"
    value={newTime}
    onChange={(e) => setNewTime(e.target.value)}
    className="mb-3 w-full rounded border p-3"
  />

  <button
    onClick={handleAddTime}
    className="rounded bg-black px-4 py-2 text-white"
  >
    + Dodaj termin
  </button>
</div>

<div className="mb-6 rounded-2xl bg-white p-4 shadow">
  <label className="mb-2 block font-medium">Odaberite datum</label>

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

  <button
    onClick={handleImageUpload}
    className="mt-4 rounded bg-black px-4 py-2 text-white"
  >
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
            <div key={booking.id} className="rounded-2xl bg-white p-5 shadow">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{booking.booking_time}</p>
                  <p className="text-sm text-gray-500">
                    {booking.booking_date}
                  </p>
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
  <strong>Email:</strong> {booking.email || "Nije uneseno"}
</p>
<p>
  <strong>Usluga:</strong> {booking.service || "Nije odabrano"}
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