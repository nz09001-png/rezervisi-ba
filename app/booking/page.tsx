"use client"

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function BookingContent() {
  const [booked, setBooked] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
const [selectedService, setSelectedService] = useState("");

  const searchParams = useSearchParams();
const salon = searchParams.get("salon") || "Salon X";
const time = searchParams.get("time") || "10:00";
const dateFromUrl = searchParams.get("date") || "";
const salonId =
  salon === "Barber House Sarajevo"
    ? 1
    : salon === "Gentlemen Tuzla"
    ? 2
    : salon === "Mostar Fade Studio"
    ? 3
    : null;
    useEffect(() => {
  async function fetchServices() {
    if (!salonId) return;

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("salon_id", salonId)
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setServices(data || []);
  }

  fetchServices();
}, [salonId]);

  async function handleBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const customerName = formData.get("customer_name") as string;
    const phone = formData.get("phone") as string;
    const bookingDate = dateFromUrl || (formData.get("booking_date") as string);
    const service = selectedService;

    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("*")
      .eq("salon", salon)
      .eq("booking_time", time)
      .eq("booking_date", bookingDate)
      .maybeSingle();

    if (existingBooking) {
      alert("Denna tid är redan bokad. Välj en annan tid.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("bookings").insert({
  customer_name: customerName,
  phone: phone,
  salon: salon,
  service: service,
  booking_time: time,
  booking_date: bookingDate,
});

    if (error) {
      alert("Något gick fel. Försök igen.");
      console.error(error);
      setLoading(false);
      return;
    }

    setConfirmedDate(bookingDate);
    setBooked(true);
    setLoading(false);
  }

  if (booked) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow text-center">
          <h1 className="text-3xl font-bold mb-4">Rezervacija uspješna!</h1>

          <div className="mb-6 space-y-2">
  <p>
    <strong>Salong:</strong> {salon}
  </p>

  <p>
    <strong>Datum:</strong> {confirmedDate}
  </p>

  <p>
    <strong>Tid:</strong> {time}
  </p>
</div>

          <a href="/" className="bg-black text-white px-6 py-3 rounded-lg">
            Nazad na početnu
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-4">Rezerviši termin</h1>

        <p className="text-gray-600 mb-6">
          {salon} – {time}
        </p>

        <form className="space-y-4" onSubmit={handleBooking}>
          <div>
  <label className="block mb-1 font-medium">Usluga</label>
  <select
    value={selectedService}
    onChange={(e) => setSelectedService(e.target.value)}
    className="w-full border p-3 rounded-lg"
    required
  >
    <option value="">Odaberite uslugu</option>

    {services.map((service) => (
      <option key={service.id} value={`${service.name} - ${service.price}`}>
        {service.name} - {service.price}
      </option>
    ))}
  </select>
</div>
          <div>
            <label className="block mb-1 font-medium">Ime i prezime</label>
            <input
              name="customer_name"
              className="w-full border p-3 rounded-lg"
              type="text"
              placeholder="Ditt namn"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Broj telefona</label>
            <input
              name="phone"
              className="w-full border p-3 rounded-lg"
              type="tel"
              placeholder="+387..."
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Datum</label>
<input
  name="booking_date"
  className="w-full border p-3 rounded-lg"
  type="date"
  defaultValue={dateFromUrl}
  required
/>
          </div>

          <button
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded-lg"
          >
            {loading ? "Rezervišem..." : "Potvrdi rezervaciju"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function Booking() {
  return (
    <Suspense fallback={<div>učitava se...</div>}>
      <BookingContent />
    </Suspense>
  );
}