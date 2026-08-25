"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SalonPage() {
  const params = useParams();
  const salonSlug = params.salonSlug as string;
const [serviceBarbers, setServiceBarbers] = useState<any[]>([]);
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
const [isMobile, setIsMobile] = useState(false);
const [selectedBarberByService, setSelectedBarberByService] = useState<
  Record<number, number | null>
>({});



useEffect(() => {
  async function fetchServiceBarbers() {
    const { data, error } = await supabase
      .from("service_barbers")
      .select("service_id, barber_id");

    if (error) {
      console.error(error);
      return;
    }

    setServiceBarbers(data || []);
  }

  fetchServiceBarbers();
}, []);


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

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  checkMobile();

  window.addEventListener("resize", checkMobile);

  return () => {
    window.removeEventListener("resize", checkMobile);
  };
}, []);

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
  <main
  className="min-h-screen"
  style={{ backgroundColor: "#f7f3ee" }}
>
    <div style={{ position: "relative" }}>
  <img
    src={
      salon.image_url ||
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80"
    }
    alt={salon.salon_name}
    style={{
  width: "100%",
  height: "400px",
  objectFit: "cover",
  objectPosition: salon.hero_position || "center",
  display: "block",
  position: "relative",
  zIndex: 1,
}}
  />

  <section
  className="px-4 pb-10 md:px-8"
  style={{
    maxWidth: "1000px",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "-60px",
    position: "relative",
    zIndex: 5,
  }}
>
    <div
  className="rounded-3xl bg-white p-5 shadow-2xl md:p-8"
  style={{
    position: "relative",
    zIndex: 10,
  }}
>
       <div className="mb-6">
  <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-gray-500">
    Frizerski salon
  </p>

  <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-950 md:text-4xl">
    {salon.salon_name}
  </h1>

  <p className="max-w-2xl text-base leading-relaxed text-gray-600">
    {salon.description}
  </p>
</div>

        <div style={{ marginBottom: "48px" }}>
  <h2
    style={{
      color: "#611a1a",
      fontSize: "28px",
      fontWeight: "600",
      marginBottom: "18px",
    }}
  >
    Lokacija
  </h2>

  <div
    style={{
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "1.15fr 0.85fr",
  gap: "20px",
  alignItems: "stretch",
}}
  >
    {/* GOOGLE MAPS - LIJEVO */}
    <div
      style={{
  height: isMobile ? "320px" : "360px",
  border: "1px solid rgba(97, 26, 26, 0.18)",
  borderRadius: "20px",
  overflow: "hidden",
  backgroundColor: "#ffffff",
  display: "flex",
  flexDirection: "column",
  order: isMobile ? 2 : 1,
}}
    >
      <iframe
        src={`https://www.google.com/maps?q=${encodeURIComponent(
          salon.address || ""
        )}&output=embed`}
        width="100%"
        style={{
          border: 0,
          display: "block",
          flex: 1,
          minHeight: 0,
        }}
        loading="lazy"
      />

      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid #eeeeee",
          backgroundColor: "#ffffff",
        }}
      >
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            salon.address || ""
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            width: "100%",
            backgroundColor: "#611a1a",
            color: "#ffffff",
            padding: "11px 16px",
            borderRadius: "12px",
            fontWeight: "700",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          Otvori u Google Maps
        </a>
      </div>
    </div>

    {/* INFORMACIJE - DESNO */}
    <div
      style={{
  height: isMobile ? "auto" : "360px",
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr",
gridTemplateRows: isMobile ? "auto auto" : "repeat(3, 1fr)",
  gap: "14px",
  order: isMobile ? 1 : 2,
}}
    >
      <div
        style={{
          border: "1px solid rgba(97, 26, 26, 0.18)",
          borderRadius: "18px",
          padding: "20px",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            color: "#611a1a",
            fontSize: "15px",
            fontWeight: "700",
            marginBottom: "6px",
          }}
        >
          Adresa
        </p>

        <p
          style={{
            color: "#111827",
            fontSize: "16px",
            fontWeight: "700",
            lineHeight: "1.5",
          }}
        >
          {salon.address}
        </p>
      </div>

      <div
        style={{
          border: "1px solid rgba(97, 26, 26, 0.18)",
          borderRadius: "18px",
          padding: "20px",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            color: "#611a1a",
            fontSize: "15px",
            fontWeight: "700",
            marginBottom: "6px",
          }}
        >
          Telefon
        </p>

        <p
          style={{
            color: "#111827",
            fontSize: "16px",
            fontWeight: "700",
            lineHeight: "1.5",
          }}
        >
          {salon.phone}
        </p>
      </div>

      <div
        style={{
  border: "1px solid rgba(97, 26, 26, 0.18)",
  borderRadius: "18px",
  padding: "20px",
  backgroundColor: "#ffffff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gridColumn: isMobile ? "1 / -1" : "auto",
}}
      >
        <p
          style={{
            color: "#611a1a",
            fontSize: "15px",
            fontWeight: "700",
            marginBottom: "6px",
          }}
        >
          Radno vrijeme
        </p>

        <p
          style={{
            color: "#111827",
            fontSize: "16px",
            fontWeight: "700",
            lineHeight: "1.5",
          }}
        >
          {salon.opening_hours}
        </p>
      </div>
    </div>
  </div>
</div>
{salonImages.length > 0 && (
  <div style={{ marginBottom: "48px", width: "100%" }}>
    <h2
      style={{
        color: "#611a1a",
        marginBottom: "20px",
        fontSize: "26px",
        fontWeight: "600",
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
  height: isMobile ? "160px" : "260px",
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
          left: isMobile ? "8px" : "16px",
          top: "50%",
          transform: "translateY(-50%)",
          width: isMobile ? "36px" : "44px",
          height: isMobile ? "36px" : "44px",
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#611a1a",
          color: "white",
          fontSize: isMobile ? "20px" : "24px",
          fontWeight: "700",
          cursor: "pointer",
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.16)",
        }}
      >
        ‹
      </button>

      <button
        type="button"
        onClick={nextGalleryImages}
        style={{
          position: "absolute",
          right: isMobile ? "8px" : "16px",
          top: "50%",
          transform: "translateY(-50%)",
          width: isMobile ? "36px" : "44px",
          height: isMobile ? "36px" : "44px",
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#611a1a",
          color: "white",
          fontSize: isMobile ? "20px" : "24px",
          fontWeight: "700",
          cursor: "pointer",
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.16)",
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
        

<h2
  style={{
    color: "#611a1a",
    fontSize: "28px",
    fontWeight: "600",
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
  border: "1px solid rgba(97, 26, 26, 0.16)",
  borderRadius: "18px",
  padding: "18px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "24px",
  backgroundColor: "#ffffff",
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)",
}}
    >
      <div>
        <h3
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "6px",
          }}
        >
          {service.name}
        </h3>
        {service.description && (
  <p
    style={{
      color: "#6b7280",
      fontSize: "15px",
      marginBottom: "10px",
      lineHeight: "1.5",
    }}
  >
    {service.description}
  </p>
)}

       <div
  style={{
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  }}
>
  {service.show_price && service.price && (
    <span
      style={{
        color: "#111827",
        fontWeight: "700",
        fontSize: "16px",
      }}
    >
      {service.price} BAM
    </span>
  )}

  {service.show_price &&
    service.price &&
    service.show_duration &&
    service.duration_minutes && (
      <span
        style={{
          color: "#6b7280",
          fontWeight: "500",
        }}
      >
        •
      </span>
    )}

  {service.show_duration && service.duration_minutes && (
    <span
      style={{
        color: "#6b7280",
        fontWeight: "500",
      }}
    >
      {service.duration_minutes} min
    </span>
  )}
</div>

{salon.show_barbers && (
  <div style={{ marginTop: "16px" }}>
    <p
      style={{
        marginBottom: "8px",
        fontWeight: "700",
        color: "#111827",
      }}
    >
      Frizer
    </p>

    <select
      value={selectedBarberByService[service.id] ?? ""}
      onChange={(e) => {
        const value = e.target.value;

        setSelectedBarberByService((previous) => ({
          ...previous,
          [service.id]: value ? Number(value) : null,
        }));
      }}
      style={{
        width: "100%",
        maxWidth: "280px",
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        padding: "10px 12px",
        backgroundColor: "white",
      }}
    >
      <option value="">Bilo koji frizer</option>

      {barbers
  .filter((barber) => {
    const linkedBarberIds = serviceBarbers
      .filter((link) => link.service_id === service.id)
      .map((link) => link.barber_id);

    return (
      linkedBarberIds.length === 0 ||
      linkedBarberIds.includes(barber.id)
    );
  })
  .map((barber) => (
    <option key={barber.id} value={barber.id}>
      {barber.name}
    </option>
  ))}
    </select>
  </div>
)}


      </div>

      <Link
        href={`/times?salon=${encodeURIComponent(
  salon.salon_name
)}&salonSlug=${encodeURIComponent(
  salonSlug
)}&serviceId=${service.id}&barberId=${
  salon.show_barbers && selectedBarberByService[service.id]
    ? selectedBarberByService[service.id]
    : ""
}`}
       style={{
  backgroundColor: "#611a1a",
  padding: "11px 22px",
  borderRadius: "12px",
  color: "#ffffff",
  fontWeight: "700",
  fontSize: "15px",
  textDecoration: "none",
  whiteSpace: "nowrap",
  boxShadow: "0 4px 10px rgba(97, 26, 26, 0.18)",
}}
      >
        Rezerviši
      </Link>
    </div>
  ))}
</div>



            </div>
    </section>
  </div>
  </main>
);
}