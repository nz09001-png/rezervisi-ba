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
  const [salonImages, setSalonImages] = useState<any[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
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
  async function fetchSalonImages() {
    if (!salon?.id) return;

    const { data, error } = await supabase
      .from("salon_images")
      .select("*")
      .eq("salon_id", salon.id)
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setSalonImages(data || []);
  }

  fetchSalonImages();
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
const visibleImages = salonImages.slice(galleryIndex, galleryIndex + 2);

function nextGalleryImages() {
  if (galleryIndex + 2 >= salonImages.length) {
    setGalleryIndex(0);
  } else {
    setGalleryIndex(galleryIndex + 2);
  }
}

function previousGalleryImages() {
  if (galleryIndex === 0) {
    setGalleryIndex(Math.max(salonImages.length - 2, 0));
  } else {
    setGalleryIndex(Math.max(galleryIndex - 2, 0));
  }
}

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

    <section className="mx-auto -mt-12 max-w-4xl px-4 py-10 md:px-8">
      <div className="rounded-3xl bg-white p-6 shadow-xl md:p-10">
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
  <div
    className="rounded-xl bg-white p-4 shadow-sm"
    style={{ borderTop: "4px solid #611a1a" }}
  >
    <p style={{ color: "#611a1a" }} className="text-sm font-semibold">
      Adresa
    </p>
    <p className="font-semibold">{salon.address}</p>
  </div>

  <div
    className="rounded-xl bg-white p-4 shadow-sm"
    style={{ borderTop: "4px solid #611a1a" }}
  >
    <p style={{ color: "#611a1a" }} className="text-sm font-semibold">
      Telefon
    </p>
    <p className="font-semibold">{salon.phone}</p>
  </div>

  <div
    className="rounded-xl bg-white p-4 shadow-sm"
    style={{ borderTop: "4px solid #611a1a" }}
  >
    <p style={{ color: "#611a1a" }} className="text-sm font-semibold">
      Radno vrijeme
    </p>
    <p className="font-semibold">{salon.opening_hours}</p>
  </div>
</div>

{salonImages.length > 0 && (
  <div style={{ marginBottom: "48px", width: "100%" }}>
    <h2
      style={{
        color: "#611a1a",
        marginBottom: "20px",
        fontSize: "30px",
        fontWeight: "800",
      }}
    >
      Galerija
    </h2>

    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        width: "100%",
      }}
    >
      {visibleImages.map((image, index) => (
  <div
    key={image.id}
    onClick={() => setSelectedImageIndex(galleryIndex + index)}
    style={{
      width: "100%",
      height: "320px",
      borderRadius: "20px",
      backgroundImage: `url(${image.image_url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      cursor: "pointer",
    }}
  />
))}

      <button
        type="button"
        onClick={previousGalleryImages}
        style={{
          position: "absolute",
          left: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "52px",
          height: "52px",
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#611a1a",
          color: "white",
          fontSize: "30px",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        ‹
      </button>

      <button
        type="button"
        onClick={nextGalleryImages}
        style={{
          position: "absolute",
          right: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "52px",
          height: "52px",
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#611a1a",
          color: "white",
          fontSize: "30px",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        ›
      </button>
    </div>
  </div>
)}
        {selectedImageIndex !== null && salonImages[selectedImageIndex] && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}
  >
    <button
      type="button"
      onClick={() => setSelectedImageIndex(null)}
      style={{
        position: "absolute",
        top: "24px",
        right: "32px",
        color: "white",
        background: "transparent",
        border: "none",
        fontSize: "42px",
        cursor: "pointer",
      }}
    >
      ×
    </button>

    <button
      type="button"
      onClick={() =>
        setSelectedImageIndex(
          selectedImageIndex === 0
            ? salonImages.length - 1
            : selectedImageIndex - 1
        )
      }
      style={{
        position: "absolute",
        left: "32px",
        color: "white",
        backgroundColor: "#611a1a",
        border: "none",
        width: "56px",
        height: "56px",
        borderRadius: "999px",
        fontSize: "34px",
        cursor: "pointer",
      }}
    >
      ‹
    </button>

    <img
      src={salonImages[selectedImageIndex].image_url}
      alt="Slika salona"
      style={{
        maxWidth: "90%",
        maxHeight: "90%",
        objectFit: "contain",
        borderRadius: "16px",
      }}
    />

    <button
      type="button"
      onClick={() =>
        setSelectedImageIndex(
          selectedImageIndex === salonImages.length - 1
            ? 0
            : selectedImageIndex + 1
        )
      }
      style={{
        position: "absolute",
        right: "32px",
        color: "white",
        backgroundColor: "#611a1a",
        border: "none",
        width: "56px",
        height: "56px",
        borderRadius: "999px",
        fontSize: "34px",
        cursor: "pointer",
      }}
    >
      ›
    </button>

    <p
      style={{
        position: "absolute",
        bottom: "32px",
        color: "white",
        fontWeight: "600",
      }}
    >
      {selectedImageIndex + 1} / {salonImages.length}
    </p>
  </div>
)}
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
  style={{
    backgroundColor: "#611a1a",
  }}
  className="mt-4 inline-block rounded-xl px-5 py-3 font-semibold text-white"
>
  Otvori u Google Maps
</a>
</div>

<h2
  style={{
    color: "#611a1a",
    fontSize: "30px",
    fontWeight: "700",
    marginBottom: "24px",
  }}
>
  Usluge
</h2>

<div className="mb-8 space-y-4">
  {services.map((service) => (
    <div
      key={service.id}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "20px",
        padding: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <div>
        <h3
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          {service.name}
        </h3>

        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              backgroundColor: "#f3f4f6",
              padding: "6px 12px",
              borderRadius: "999px",
              fontWeight: "600",
            }}
          >
            {service.price} KM
          </span>

          <span
            style={{
              color: "#6b7280",
              fontWeight: "500",
            }}
          >
            {service.duration_minutes || 60} min
          </span>
        </div>
      </div>

      <Link
        href={`/times?salon=${encodeURIComponent(
          salon.salon_name
        )}&salonSlug=${encodeURIComponent(
          salonSlug
        )}&serviceId=${service.id}`}
        style={{
          backgroundColor: "#611a1a",
          padding: "14px 32px",
          borderRadius: "12px",
          color: "white",
          fontWeight: "700",
          textDecoration: "none",
        }}
      >
        Boka
      </Link>
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