"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createPortal } from "react-dom";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";
import {
  DM_Serif_Display,
  Montserrat,
  Outfit,
  Source_Sans_3,
  Geist,
} from "next/font/google";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
});

const outfit = Outfit({
  subsets: ["latin"],
});

// Salongsnamnet – samma typsnitt som salongskorten på startsidan.
const montserrat = Montserrat({
  weight: "600",
  subsets: ["latin", "latin-ext"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
});

const geist = Geist({
  subsets: ["latin"],
});

export default function SalonPage() {
  const params = useParams();
  const salonSlug = params.salonSlug as string;
const [serviceBarbers, setServiceBarbers] = useState<any[]>([]);
  const [salon, setSalon] = useState<any>(null);
  const [shortenedHours, setShortenedHours] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
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
// Sant när salongen inte finns (fel adress), så att sidan inte laddar för evigt.
const [notFound, setNotFound] = useState(false);
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
      setNotFound(true);
      return;
    }

    setSalon(data);

    const { data: shortenedHoursData, error: shortenedHoursError } =
      await supabase
        .from("salon_shortened_hours")
        .select("*")
        .eq("salon_id", data.id);

    if (shortenedHoursError) {
      console.error(
        "Greška pri učitavanju skraćenog radnog vremena:",
        shortenedHoursError
      );
      return;
    }

    setShortenedHours(shortenedHoursData || []);
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
  fetchServiceCategories();
}, [salon]);

async function fetchServiceCategories() {
  if (!salon?.id) return;

  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("salon_id", salon.id)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  setServiceCategories(data || []);
}

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

useEffect(() => {
  if (selectedImageIndex !== null) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [selectedImageIndex]);

if (notFound) {
  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "#f7f3ee",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        className="rounded-3xl bg-white shadow-2xl"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <img
          src="/salonix-horisontell-maroon.png"
          alt="Salonix"
          style={{ height: "34px", width: "auto", margin: "0 auto 24px" }}
        />

        <h1
          className={dmSerif.className}
          style={{ color: "#611a1a", fontSize: "28px", marginBottom: "10px" }}
        >
          Salon nije pronađen
        </h1>

        <p
          className={sourceSans.className}
          style={{
            color: "#6b7280",
            fontSize: "16px",
            lineHeight: "1.5",
            marginBottom: "24px",
          }}
        >
          Provjerite adresu ili pronađite salon na Salonixu.
        </p>

        <Link
          href="/"
          className={geist.className}
          style={{
            display: "inline-block",
            backgroundColor: "#611a1a",
            padding: "11px 22px",
            borderRadius: "12px",
            color: "#ffffff",
            fontWeight: "700",
            fontSize: "15px",
            textDecoration: "none",
            boxShadow: "0 4px 10px rgba(97, 26, 26, 0.18)",
          }}
        >
          Nazad na početnu
        </Link>
      </div>
    </main>
  );
}

if (!salon) {
  return (
    <main
      className={`min-h-screen ${sourceSans.className}`}
      style={{
        backgroundColor: "#f7f3ee",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6b7280",
        fontSize: "16px",
      }}
    >
      Učitava se...
    </main>
  );
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
    {/* Vit list med Salonix-loggan – leder tillbaka till startsidan. */}
    <div
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #f0e6e6",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: isMobile ? "12px 16px" : "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" aria-label="Salonix – početna" style={{ display: "block" }}>
          <img
            src="/salonix-horisontell-maroon.png"
            alt="Salonix"
            style={{
              height: isMobile ? "30px" : "32px",
              width: "auto",
              display: "block",
            }}
          />
        </Link>

        {!isMobile && (
          <Link
            href="/"
            className={sourceSans.className}
            style={{
              color: "#611a1a",
              fontWeight: 600,
              fontSize: "15px",
              textDecoration: "none",
            }}
          >
            ← Svi saloni
          </Link>
        )}
      </div>
    </div>

    <div style={{ position: "relative" }}>
  <img
    src={
      salon.image_url ||
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80"
    }
    alt={salon.salon_name}
    style={{
  width: "100%",
  height: isMobile ? "230px" : "400px",
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
  salon
  </p>

  <h1
  className={`${montserrat.className} mb-3 text-3xl md:text-4xl`}
  style={{
    color: "#611a1a",
  }}
>
  {salon.salon_name}
</h1>

  <p
  className={`max-w-2xl text-base leading-relaxed text-gray-600 ${outfit.className}`}
>
  {salon.description}
</p>
</div>

        <div
  style={{
    marginBottom: isMobile ? "24px" : "48px",
  }}
>
  <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "18px",
  }}
>
  <h2
  className={dmSerif.className}
  style={{
    color: "#611a1a",
    fontSize: isMobile ? "20px" : "28px",
    fontWeight: "600",
    margin: 0,
  }}
>
  Informacije o salonu
</h2>

  {(salon.instagram_url || salon.facebook_url || salon.tiktok_url) && (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {salon.instagram_url && (
        <a
          href={salon.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          title="Instagram"
          style={{
            color: "#611a1a",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isMobile ? "22px" : "26px",
          }}
        >
          <FaInstagram />
        </a>
      )}

      {salon.facebook_url && (
        <a
          href={salon.facebook_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          title="Facebook"
          style={{
            color: "#611a1a",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isMobile ? "22px" : "26px",
          }}
        >
          <FaFacebookF />
        </a>
      )}

      {salon.tiktok_url && (
        <a
          href={salon.tiktok_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          title="TikTok"
          style={{
            color: "#611a1a",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isMobile ? "22px" : "26px",
          }}
        >
          <FaTiktok />
        </a>
      )}
    </div>
  )}
</div>

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
  height: isMobile ? "260px" : "360px",
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
  className={geist.className}
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
    gridTemplateRows: isMobile
  ? "auto auto"
  : "auto repeat(3, 1fr)",
    gap: "14px",
    order: isMobile ? 1 : 2,
  }}
>



      <div
  className={outfit.className}
  style={{
    border: "1px solid rgba(97, 26, 26, 0.18)",
          borderRadius: "18px",
          padding: isMobile ? "14px 16px" : "20px",
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
            fontWeight: "500",
            lineHeight: "1.5",
          }}
        >
          {salon.address}
        </p>
      </div>

      <div
  className={outfit.className}
  style={{
    border: "1px solid rgba(97, 26, 26, 0.18)",
          borderRadius: "18px",
          padding: isMobile ? "14px 16px" : "20px",
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
            fontWeight: "500",
            lineHeight: "1.5",
          }}
        >
          {salon.phone ? (
            // Ringlänk: telefonen frågar själv "Ring/Avbryt" innan samtalet startar.
            <a
              href={`tel:${salon.phone.replace(/[^\d+]/g, "")}`}
              style={{
                color: "inherit",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              {salon.phone}
            </a>
          ) : null}
        </p>
      </div>

      <div
  className={outfit.className}
  style={{
    border: "1px solid rgba(97, 26, 26, 0.18)",
    borderRadius: "18px",
    padding: isMobile ? "14px 16px" : "20px",
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
            fontWeight: "500",
            lineHeight: "1.5",
          }}
        >
          {/* Samma långa streck som startsidan och de förkortade tiderna. */}
          {salon.opening_hours?.replace("-", "–")}
        </p>
        {shortenedHours.length > 0 && (
  <div
    style={{
      marginTop: "6px",
      display: "flex",
      flexDirection: "column",
      gap: "3px",
    }}
  >
    {[...shortenedHours]
      .sort((a, b) => {
        const dayOrder = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];
        return dayOrder.indexOf(a.weekday) - dayOrder.indexOf(b.weekday);
      })
      .map((item) => {
        const dayNames: Record<string, string> = {
          Pon: "Ponedjeljak",
          Uto: "Utorak",
          Sri: "Srijeda",
          Čet: "Četvrtak",
          Pet: "Petak",
          Sub: "Subota",
          Ned: "Nedjelja",
        };

        return (
          <p
            key={item.id}
            style={{
              fontSize: "15px",
              lineHeight: "1.5",
            }}
          >
            <span
              style={{
                color: "#111827",
                fontWeight: "600",
              }}
            >
              {dayNames[item.weekday] || item.weekday}:
            </span>{" "}
            <span
              style={{
                color: "#111827",
                fontWeight: "500",
              }}
            >
              {item.start_time.slice(0, 5)}–{item.end_time.slice(0, 5)}
            </span>
          </p>
        );
      })}
  </div>
)}
        {salon.closed_weekdays?.length > 0 && (
  <div
    style={{
      marginTop: "6px",
      display: "flex",
      flexDirection: "column",
      gap: "3px",
    }}
  >
    {[...salon.closed_weekdays]
  .sort((a: string, b: string) => {
    const dayOrder = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];
    return dayOrder.indexOf(a) - dayOrder.indexOf(b);
  })
  .map((day: string) => {
      const dayNames: Record<string, string> = {
        Pon: "Ponedjeljak",
        Uto: "Utorak",
        Sri: "Srijeda",
        Čet: "Četvrtak",
        Pet: "Petak",
        Sub: "Subota",
        Ned: "Nedjelja",
      };

      return (
        <p
          key={day}
          style={{
            fontSize: "15px",
            lineHeight: "1.5",
          }}
        >
          <span
            style={{
              color: "#111827",
              fontWeight: "600",
            }}
          >
            {dayNames[day] || day}:
          </span>{" "}
          <span
  style={{
    color: "#111827",
    fontWeight: "500",
  }}
>
  Zatvoreno
</span>
        </p>
      );
    })}
  </div>
)}
      </div>
    </div>
  </div>
</div>
{salonImages.length > 0 && (
  <div
  style={{
    marginBottom: isMobile ? "32px" : "48px",
    width: "100%",
  }}
>
    <h2
  className={dmSerif.className}
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

      {/* Pilarna bara när det finns fler bilder än de två som syns. */}
      {salonImages.length > 2 && (
      <>
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
      </>
      )}
    </div>
  </div>
)}
 {typeof document !== "undefined" &&
  selectedImageIndex !== null &&
  salonImages[selectedImageIndex] &&
  createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.9)",
        zIndex: 9999,
      }}
    >
      {/* BILDYTA */}
      <div
        style={{
          position: "fixed",
          top: isMobile ? "64px" : "40px",
          bottom: isMobile ? "64px" : "40px",
          left: isMobile ? "48px" : "90px",
          right: isMobile ? "48px" : "90px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={salonImages[selectedImageIndex].image_url}
          alt="Slika salona"
          style={{
  width: "100%",
  height: "100%",
  objectFit: "contain",
  objectPosition: "center top",
  borderRadius: "16px",
}}
        />
      </div>

      {/* STÄNG */}
      <button
        type="button"
        onClick={() => setSelectedImageIndex(null)}
        style={{
          position: "fixed",
          top: isMobile ? "14px" : "24px",
          right: isMobile ? "16px" : "32px",
          color: "#ffffff",
          background: "transparent",
          border: "none",
          fontSize: "42px",
          cursor: "pointer",
          zIndex: 10002,
        }}
      >
        ×
      </button>

      {/* FÖREGÅENDE och NÄSTA – bara när det finns mer än en bild. */}
      {salonImages.length > 1 && (
      <>
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
          position: "fixed",
          left: isMobile ? "8px" : "32px",
          top: "50%",
          transform: "translateY(-50%)",
          width: isMobile ? "38px" : "56px",
          height: isMobile ? "38px" : "56px",
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#611a1a",
          color: "#ffffff",
          fontSize: isMobile ? "24px" : "34px",
          cursor: "pointer",
          zIndex: 10002,
        }}
      >
        ‹
      </button>

      {/* NÄSTA */}
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
          position: "fixed",
          right: isMobile ? "8px" : "32px",
          top: "50%",
          transform: "translateY(-50%)",
          width: isMobile ? "38px" : "56px",
          height: isMobile ? "38px" : "56px",
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#611a1a",
          color: "#ffffff",
          fontSize: isMobile ? "24px" : "34px",
          cursor: "pointer",
          zIndex: 10002,
        }}
      >
        ›
      </button>
      </>
      )}

      {/* BILDRÄKNARE */}
      <p
        style={{
          position: "fixed",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#ffffff",
          fontWeight: "600",
          margin: 0,
          zIndex: 10002,
        }}
      >
        {selectedImageIndex + 1} / {salonImages.length}
      </p>
    </div>,
    document.body
  )}
        

<h2
  className={dmSerif.className}
  style={{
    color: "#611a1a",
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: isMobile ? "12px" : "24px",
  }}
>
  Usluge
</h2>

<div className="mb-8 space-y-8">
  {serviceCategories.map((category) => {
    const categoryServices = services.filter(
      (service) => service.category_id === category.id
    );

    if (categoryServices.length === 0) return null;

    return (
      <div
  key={category.id}
  style={{
    marginTop: isMobile ? "12px" : "32px",
  }}
>
  <h2
  className={dmSerif.className}
  style={{
    fontSize: "20px",
    fontWeight: "700",
    color: "#611a1a",
    marginBottom: "14px",
    paddingBottom: "8px",
    borderBottom: "2px solid rgba(97, 26, 26, 0.22)",
    letterSpacing: "0.2px",
  }}
>
  {category.name}
</h2>

        <div className="space-y-4">
          {categoryServices.map((service) => (
   <div
  key={service.id}
  className={sourceSans.className}
  style={{
    border: "1px solid rgba(97, 26, 26, 0.16)",
    borderRadius: "18px",
    padding: isMobile ? "14px 16px" : "18px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: isMobile ? "12px" : "24px",
    // Mobil: blir texten för lång hamnar Rezerviši på en egen rad under.
    flexWrap: isMobile ? "wrap" : "nowrap",
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
        fontWeight: "600",
        fontSize: "16px",
      }}
    >
      {service.price} KM
    </span>
  )}

  {service.show_price &&
    service.price &&
    service.show_duration &&
    service.duration_minutes && (
      <span
  style={{
    color: "#111827",
    fontWeight: "600",
    fontSize: "16px",
  }}
>
  •
</span>
    )}

  {service.show_duration && service.duration_minutes && (
    <span
  style={{
    color: "#111827",
    fontWeight: "600",
    fontSize: "16px",
  }}
>
  {service.duration_minutes} min
</span>
  )}
</div>

{salon.show_barbers && (
  <div
    style={{
      marginTop: isMobile ? "12px" : "16px",
    }}
  >
    <p
      style={{
        marginBottom: "8px",
        fontWeight: "600",
        color: "#111827",
      }}
    >
      Osoblje
    </p>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? "10px" : "0px",
      }}
    >
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
  width: "150px",
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  padding: "10px 12px",
  backgroundColor: "white",
}}
      >
        <option value="">Bez preferencije</option>

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

      {isMobile && (
  <Link
    className={geist.className}
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
  display: "inline-block",
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
      )}
    </div>
  </div>
)}

      </div>

      {/* Mobil: när personal inte visas står Rezerviši till höger i kortet (som på desktop). */}
      {isMobile && !salon.show_barbers && (
        <Link
          className={geist.className}
          href={`/times?salon=${encodeURIComponent(
            salon.salon_name
          )}&salonSlug=${encodeURIComponent(
            salonSlug
          )}&serviceId=${service.id}&barberId=`}
          style={{
            display: "inline-block",
            flexShrink: 0,
            // Alltid i högerkanten, även när knappen hamnar på en egen rad.
            marginLeft: "auto",
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
      )}

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
        display: isMobile ? "none" : "inline-block",
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
    );
  })}
</div>



            </div>
    </section>
  </div>

    {/* Sidfot i samma stil som startsidan. */}
    <footer
      className={sourceSans.className}
      style={{
        backgroundColor: "#faf6f6",
        borderTop: "1px solid #f0e6e6",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: isMobile ? "28px 20px 32px" : "28px 32px 32px",
          display: isMobile ? "block" : "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <div>
          <Link href="/" aria-label="Salonix – početna" style={{ display: "inline-block" }}>
            <img
              src="/salonix-horisontell-maroon.png"
              alt="Salonix"
              style={{ height: "28px", width: "auto", display: "block" }}
            />
          </Link>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.5,
              color: "#6b7280",
              margin: "12px 0 0",
            }}
          >
            Pronađite još salona i rezervišite termin online.
          </p>
        </div>

        <p
          style={{
            fontSize: "13px",
            color: "#9ca3af",
            margin: isMobile ? "20px 0 0" : 0,
          }}
        >
          © {new Date().getFullYear()} Salonix · salonix.ba
        </p>
      </div>
    </footer>
  </main>
);
}