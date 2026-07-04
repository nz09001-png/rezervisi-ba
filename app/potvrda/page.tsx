"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function PotvrdaPage() {
  const searchParams = useSearchParams();
const router = useRouter();

  const salon = searchParams.get("salon");
  const salonSlug = searchParams.get("salonSlug");
  console.log("salonSlug:", salonSlug);
  const serviceId = searchParams.get("serviceId");
const date = searchParams.get("date");
const formattedDate = date
  ? `${date.split("-")[2]}.${date.split("-")[1]}.${date.split("-")[0]}.`
  : "";
const time = searchParams.get("time");
  const ime = searchParams.get("ime");
  const prezime = searchParams.get("prezime");
  const phoneCode = searchParams.get("phoneCode");
  const phone = searchParams.get("phone");
  const email = searchParams.get("email");
  const napomena = searchParams.get("napomena");
  const [service, setService] = useState<any>(null);
const [loading, setLoading] = useState(false);
const [confirmed, setConfirmed] = useState(false);
const [timeTaken, setTimeTaken] = useState(false);

useEffect(() => {
  async function fetchService() {
    if (!serviceId) return;

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setService(data);
  }

  fetchService();
}, [serviceId]);
async function handleConfirmBooking() {
  if (confirmed) return;

  setTimeTaken(false);
  setLoading(true);

  console.log("Bokning ska sparas:", {
    salon,
    service,
    date,
    time,
    ime,
    prezime,
    phoneCode,
    phone,
    email,
    napomena,
  });
  const cancelToken = crypto.randomUUID();
  const { data: existingBooking, error: existingBookingError } = await supabase
  .from("bookings")
  .select("id")
  .eq("salon", salon)
  .eq("booking_date", date)
  .eq("booking_time", time)
  .maybeSingle();

if (existingBookingError) {
  console.error(existingBookingError);
  alert("Greška pri provjeri termina.");
  setLoading(false);
  return;
}

if (existingBooking) {
  setTimeTaken(true);
  setLoading(false);
  return;
}
  const { data, error } = await supabase
  .from("bookings")
  .insert([
    {
      customer_name: `${ime} ${prezime}`,
      phone: `${phoneCode} ${phone}`,
      salon,
      booking_time: time,
      booking_date: date,
      service: service?.name,
      email: email || null,
      cancel_token: cancelToken,
    },
  ])
  .select()
  .single();
  if (error) {
  console.error(error);
  alert("Greška pri spremanju rezervacije.");
  setLoading(false);
  return;
}
if (email && email.trim()) {
  const emailResponse = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      salon,
      service: service?.name,
      date,
      time,
      durationMinutes: service?.duration_minutes || 60,
      bookingId: data.id,
      cancelToken,
    }),
  });

  const emailResult = await emailResponse.json();

  console.log("Email-resultat:", emailResult);
}
setConfirmed(true);

router.push(
  `/uspjesno?salon=${encodeURIComponent(salon || "")}&salonSlug=${encodeURIComponent(
    salonSlug || ""
  )}&service=${encodeURIComponent(service?.name || "")}&date=${encodeURIComponent(
    date || ""
  )}&time=${encodeURIComponent(time || "")}&ime=${encodeURIComponent(
    ime || ""
  )}&prezime=${encodeURIComponent(
    prezime || ""
  )}&email=${encodeURIComponent(email || "")}`
);
}

  return (
    <main className="min-h-screen bg-white px-8 py-6">
      <Link
  href={`/podaci?salon=${encodeURIComponent(
    salon || ""
  )}&salonSlug=${encodeURIComponent(
    salonSlug || ""
  )}&serviceId=${serviceId}&date=${encodeURIComponent(
    date || ""
  )}&time=${encodeURIComponent(time || "")}`}
  style={{
    color: "#611a1a",
    textDecoration: "none",
    fontWeight: "700",
    display: "inline-block",
    marginBottom: "16px",
  }}
>
  ← Nazad
</Link>
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 flex items-end justify-between">
          <h1
  className="text-3xl font-bold"
  style={{
    marginLeft: "310px",
    color: "#611a1a",
  }}
>
            Pregled rezervacije
          </h1>
          <div
  className="flex items-center gap-2"
  style={{
    marginRight: "100px",
    marginTop: "-75px",
  }}
>
  {[
  { nr: "1", label: "USLUGA" },
  { nr: "2", label: "VRIJEME" },
  { nr: "3", label: "PODACI" },
  { nr: "4", label: "POTVRDA" },
].map((step, index) => (
  <div key={step.nr} className="flex items-center gap-4">
    <div className="flex flex-col items-center">
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "9999px",
          backgroundColor: "#611a1a",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          fontWeight: "bold",
        }}
      >
        {step.nr}
      </div>

      <p
        style={{
          marginTop: "4px",
          fontSize: "11px",
          fontWeight: "600",
          color: "#611a1a",
        }}
      >
        {step.label}
      </p>
    </div>

    {index < 3 && (
      <div
        style={{
          width: "15px",
          height: "1px",
          backgroundColor: "#611a1a",
          marginBottom: "24px",
        }}
      />
    )}
  </div>
))}
</div>
          <div className="mt-4 h-1.5 w-24 bg-[#611a1a]" />
        </div>
        
  <div
  className="mb-6 inline-block rounded-xl border px-5 py-3"
  style={{
  backgroundColor: "rgba(97, 26, 26, 0.03)",
  border: "1px solid rgba(97, 26, 26, 0.15)",
  marginLeft: "310px",
  marginTop: "10px",
}}
>
  <p className="font-bold">
    {salon}
  </p>

  <p className="text-gray-600">
    {service
      ? `${service.name} • ${service.price} KM • ${service.duration_minutes || 60} min`
      : "Učitava se..."}
  </p>

  <p className="mt-1 text-sm font-medium text-[#611a1a]">
    {formattedDate} • {time}
  </p>
</div>



        <div
  className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-sm"
  style={{
    border: "3px solid #611a1a",
  }}
>
  <h2
  className="mb-10 text-center text-xl font-bold"
  style={{ color: "#611a1a" }}
>
  Podaci klijenta
</h2>

<div
  className="mx-auto"
  style={{
    width: "340px",
    transform: "translateX(30px)",
  }}
>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "120px 1fr",
      padding: "8px 0",
      borderBottom: "1px solid #f1f1f1",
      alignItems: "center",
      
    }}
  >
    <span style={{ fontWeight: "700", color: "#611a1a", textAlign: "right", paddingRight: "20px" }}>
      Ime:
    </span>
    <span>{ime}</span>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "120px 1fr",
      padding: "8px 0",
      borderBottom: "1px solid #f1f1f1",
      alignItems: "center",
    }}
  >
    <span style={{ fontWeight: "700", color: "#611a1a", textAlign: "right", paddingRight: "20px" }}>
      Prezime:
    </span>
    <span>{prezime}</span>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "120px 1fr",
      padding: "8px 0",
      borderBottom: "1px solid #f1f1f1",
      alignItems: "center",
    }}
  >
    <span style={{ fontWeight: "700", color: "#611a1a", textAlign: "right", paddingRight: "20px" }}>
      Telefon:
    </span>
    <span>{phoneCode} {phone}</span>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "120px 1fr",
      padding: "8px 0",
      borderBottom: "1px solid #f1f1f1",
      alignItems: "center",
    }}
  >
    <span style={{ fontWeight: "700", color: "#611a1a", textAlign: "right", paddingRight: "20px" }}>
      Email:
    </span>
    <span>{email}</span>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "120px 1fr",
      padding: "8px 0",
      borderBottom: "1px solid #f1f1f1",
      alignItems: "center",
    }}
  >
    <span style={{ fontWeight: "700", color: "#611a1a", textAlign: "right", paddingRight: "20px" }}>
      Napomena:
    </span>
    <span>{napomena || "Nema napomene"}</span>
  </div>
</div>

{timeTaken && (
  <div
    className="mx-auto mt-8 max-w-md rounded-2xl p-5 text-center"
    style={{
      border: "2px solid #611a1a",
      backgroundColor: "#fff7f7",
    }}
  >
    <p
      className="mb-2 text-lg font-bold"
      style={{ color: "#611a1a" }}
    >
      ⚠ Termin je upravo rezervisan
    </p>

    <p className="mb-5 text-sm text-gray-700">
      Molimo odaberite drugi termin.
    </p>

    <button
      type="button"
      onClick={() => {
  window.history.go(-2);
}}
      style={{
        backgroundColor: "#611a1a",
        color: "white",
        padding: "10px 32px",
        borderRadius: "12px",
        fontWeight: "bold",
      }}
    >
      Nazad
    </button>
  </div>
)}
{!timeTaken && (
  <div className="mt-10 flex justify-center">
    <button
      type="button"
      onClick={handleConfirmBooking}
      disabled={loading || confirmed}
      style={{
        backgroundColor: "#611a1a",
        color: "white",
        padding: "16px 80px",
        borderRadius: "16px",
        fontWeight: "bold",
      }}
    >
      {confirmed
  ? "Rezervacija potvrđena"
  : loading
  ? "Rezerviše se..."
  : "Završi rezervaciju"}
    </button>
  </div>
)}
</div>
      </div>
    </main>
  );
}