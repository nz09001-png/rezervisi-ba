"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MapSalon } from "@/components/SalonMap";
import type { IconType } from "react-icons";
import {
  FiSearch,
  FiMenu,
  FiX,
  FiGrid,
  FiMapPin,
  FiClock,
  FiArrowRight,
  FiChevronDown,
  FiMap,
  FiList,
  FiNavigation,
  FiThumbsUp,
  FiStar,
} from "react-icons/fi";
import { TbScissors, TbMassage, TbFlower, TbHandStop, TbRazor, TbSun } from "react-icons/tb";
import { GiEyelashes, GiLeg } from "react-icons/gi";
import { supabase } from "@/lib/supabase";

import { DM_Serif_Display, Source_Sans_3 } from "next/font/google";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
});

// Namnen måste vara exakt samma som i kolumnen salons.categories i Supabase.
// Bilderna ligger i public/categories/. Ikonen används i ☰-panelen
// och på kort som ännu saknar bild.
const CATEGORIES: { name: string; icon: IconType; image?: string }[] = [
  { name: "Frizura", icon: TbScissors, image: "/categories/frizura.jpg" },
  { name: "Barber", icon: TbRazor, image: "/categories/barber.jpg" },
  { name: "Nokti", icon: TbHandStop, image: "/categories/nokti.jpg" },
  {
    name: "Trepavice i obrve",
    icon: GiEyelashes,
    image: "/categories/trepavice-i-obrve.jpg",
  },
  { name: "Depilacija", icon: GiLeg, image: "/categories/depilacija.jpg" },
  { name: "Masaža", icon: TbMassage, image: "/categories/masaza.jpg" },
  { name: "Njega lica", icon: TbFlower, image: "/categories/njega-lica.jpg" },
  { name: "Solarijum", icon: TbSun, image: "/categories/solarijum.jpg" },
];

// Kartan laddas först när kunden trycker på "Karta", och bara i webbläsaren
// (kartverktyget fungerar inte på servern).
const SalonMap = dynamic(() => import("@/components/SalonMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "65vh",
        minHeight: 380,
        borderRadius: 16,
        background: "#f5eded",
      }}
    />
  ),
});

// Från den här skärmbredden visas desktopvyn.
const DESKTOP_MIN_WIDTH = 1024;
// Innehållets största bredd på desktop.
const DESKTOP_MAX_CONTENT = 1200;

// Namnet som vald stad sparas under i kundens webbläsare.
const SAVED_CITY_KEY = "salonix_city";

// Veckodagarna i samma form som i Supabase (closed_weekdays och salon_shortened_hours).
// JavaScript räknar söndag som dag 0.
const WEEKDAY_CODES = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];

function todayDateString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// Dagens öppettider för en salong: stängd dag går före förkortade tider,
// som går före vanliga tider. Används både på korten och i filtret "Otvoreno danas".
function getTodayStatus(
  salon: any,
  todayShortenedHours: Record<number, { start_time: string; end_time: string }>,
  closedTodayIds: number[]
) {
  const shortened = todayShortenedHours[salon.id];
  const isClosedToday =
    closedTodayIds.includes(salon.id) ||
    (salon.closed_weekdays || []).includes(WEEKDAY_CODES[new Date().getDay()]);
  const todayHours: string | undefined = shortened
    ? `${shortened.start_time.slice(0, 5)}–${shortened.end_time.slice(0, 5)}`
    : salon.opening_hours?.replace("-", "–");
  // Salonger utan öppettider räknas inte som öppna, eftersom vi inte vet.
  const isOpenToday = !isClosedToday && !!todayHours;
  return { isClosedToday, todayHours, isOpenToday };
}

// Poäng för "Preporučeno": öppet i dag väger tyngst, sedan en komplett profil.
function recommendedScore(
  salon: any,
  todayShortenedHours: Record<number, { start_time: string; end_time: string }>,
  closedTodayIds: number[]
) {
  let score = 0;
  if (getTodayStatus(salon, todayShortenedHours, closedTodayIds).isOpenToday) score += 3;
  if (salon.image_url) score += 1;
  if (salon.opening_hours) score += 1;
  if (salon.address) score += 1;
  return score;
}

// Ett tal per salong som ändras varje dag. Salonger med samma poäng
// byter då ordning dagligen, så att alla får chansen att synas överst.
function dailyRotation(salonId: number) {
  const seed = `${salonId}-${todayDateString()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return hash;
}

// Avstånd fågelvägen i kilometer mellan kunden och en salong.
function distanceKm(from: { lat: number; lng: number }, lat: number, lng: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat - from.lat);
  const dLng = toRad(lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Visar "350 m" eller "1,2 km" (bosniskt decimalkomma).
function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km >= 10) return `${Math.round(km)} km`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

// Gör sökningen okänslig för stora/små bokstäver och č, ć, š, ž, đ.
function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export default function Home() {
  const [salons, setSalons] = useState<any[]>([]);
  // Dagens förkortade öppettider och stängda salonger, per salong-id.
  const [todayShortenedHours, setTodayShortenedHours] = useState<
    Record<number, { start_time: string; end_time: string }>
  >({});
  const [closedTodayIds, setClosedTodayIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showStickySearch, setShowStickySearch] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [openTodayOnly, setOpenTodayOnly] = useState(false);
  // Kundens plats för "Najbliže meni". Sparas inte någonstans, bara medan sidan är öppen.
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading">("idle");

  // Ordningen på salongerna: "Preporučeno" (standard), "Novi saloni" eller "Najbliže meni".
  const [sortMode, setSortMode] = useState<"recommended" | "newest" | "nearest">(
    "recommended"
  );

  function chooseNearest() {
    // Platsen är redan känd: byt bara ordning, fråga inte igen.
    if (userLocation) {
      setSortMode("nearest");
      return;
    }
    // Om platsen inte går att få (kunden säger nej eller telefonen saknar stöd)
    // öppnas kartan i stället, så att kunden själv kan hitta sin stad.
    const showMapInstead = () => {
      setLocationStatus("idle");
      setShowMap(true);
      setScrollRequest((n) => n + 1);
    };
    if (!navigator.geolocation) {
      showMapInstead();
      return;
    }
    setLocationStatus("loading");
    // Telefonen frågar kunden om lov att använda platsen.
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSortMode("nearest");
        setLocationStatus("idle");
      },
      showMapInstead,
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }
  const heroSearchRef = useRef<HTMLLabelElement>(null);
  const desktopHeroSearchRef = useRef<HTMLDivElement>(null);

  // Desktop = bred skärm. Mobilvyn är standard och ändras inte av desktopkoden.
  const [isDesktop, setIsDesktop] = useState(false);
  // Luft på sidorna på desktop (px): minst 40, och innehållet blir högst 1200 brett.
  const [desktopGutter, setDesktopGutter] = useState(40);
  useEffect(() => {
    const update = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_MIN_WIDTH);
      // clientWidth räknar inte med rullningslisten, så inget sticker ut i sidled.
      setDesktopGutter(
        Math.max(40, (document.documentElement.clientWidth - DESKTOP_MAX_CONTENT) / 2)
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const salonsHeadingRef = useRef<HTMLHeadingElement>(null);
  // Ökas när kunden själv väljer kategori eller stad. Då scrollar sidan ner till salongerna.
  // (En stad som väljs automatiskt vid sidladdning ska inte få sidan att scrolla.)
  const [scrollRequest, setScrollRequest] = useState(0);

  function chooseCategory(category: string | null) {
    setSelectedCategory(category);
    if (category) setScrollRequest((n) => n + 1);
  }

  // Väljer stad och sparar den i kundens egen webbläsare, så att den är vald nästa gång.
  function chooseCity(city: string | null) {
    setSelectedCity(city);
    if (city) setScrollRequest((n) => n + 1);
    try {
      if (city) {
        localStorage.setItem(SAVED_CITY_KEY, city);
      } else {
        localStorage.removeItem(SAVED_CITY_KEY);
      }
    } catch {
      // Vissa webbläsare (t.ex. privat läge) tillåter inte sparande. Då fungerar allt ändå.
    }
  }

  // Lås sidan bakom panelen så att den inte scrollar medan panelen är öppen.
  useEffect(() => {
    document.body.style.overflow = categoryMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [categoryMenuOpen]);

  // Scrolla ner till salongerna när en kategori eller stad väljs, så att kunden ser resultatet.
  useEffect(() => {
    if (scrollRequest > 0) {
      salonsHeadingRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollRequest]);

  // Städerna hämtas automatiskt från salongerna, i bokstavsordning.
  const cities = Array.from(
    new Set(salons.map((salon) => salon.city).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "bs")) as string[];

  // Visa den vita listen högst upp när det stora sökfältet har scrollats bort.
  // (På desktop är det sökraden i den vinröda toppen som följs.)
  useEffect(() => {
    const heroSearch = isDesktop ? desktopHeroSearchRef.current : heroSearchRef.current;
    if (!heroSearch) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowStickySearch(entry.boundingClientRect.bottom < 0);
    });
    observer.observe(heroSearch);
    return () => observer.disconnect();
  }, [isDesktop]);

  const searchTerm = normalize(search.trim());

  // useMemo: listan räknas bara om när salonger eller val ändras.
  // Det gör att kartan inte zoomar om varje gång sidan scrollas.
  const filteredSalons = useMemo(
    () =>
      salons.filter((salon) => {
        if (
          selectedCategory &&
          !(salon.categories || []).some(
            (category: string) => normalize(category) === normalize(selectedCategory)
          )
        ) {
          return false;
        }
        if (selectedCity && salon.city !== selectedCity) return false;
        if (
          openTodayOnly &&
          !getTodayStatus(salon, todayShortenedHours, closedTodayIds).isOpenToday
        ) {
          return false;
        }
        if (!searchTerm) return true;
        const searchable = [
          salon.salon_name,
          salon.city,
          salon.address,
          ...(salon.categories || []),
        ]
          .filter(Boolean)
          .join(" ");
        return normalize(searchable).includes(searchTerm);
      })
      .map((salon) => ({
        ...salon,
        distanceKm:
          userLocation && salon.latitude != null && salon.longitude != null
            ? distanceKm(userLocation, salon.latitude, salon.longitude)
            : null,
        score: recommendedScore(salon, todayShortenedHours, closedTodayIds),
        rotation: dailyRotation(salon.id),
      }))
      .sort((a, b) => {
        // "Najbliže meni": närmast först. Salonger utan koordinater hamnar sist.
        if (sortMode === "nearest" && userLocation) {
          return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
        }
        // "Novi saloni": högst id = senast tillagd.
        if (sortMode === "newest") return b.id - a.id;
        // "Preporučeno": högst poäng först, sedan dagens rättvisa rotation.
        return b.score - a.score || a.rotation - b.rotation;
      }),
    [
      sortMode,
      salons,
      selectedCategory,
      selectedCity,
      searchTerm,
      openTodayOnly,
      todayShortenedHours,
      closedTodayIds,
      userLocation,
    ]
  );

  // Bara salonger som har koordinater kan visas på kartan.
  const mapSalons = useMemo(
    () =>
      filteredSalons.filter(
        (salon) => salon.latitude != null && salon.longitude != null
      ) as MapSalon[],
    [filteredSalons]
  );

  useEffect(() => {
    async function loadSalons() {
      const { data, error } = await supabase
        .from("salons")
        .select(
          "id, salon_name, slug, city, categories, address, image_url, opening_hours, closed_weekdays, latitude, longitude"
        )
        .eq("is_published", true)
        .order("salon_name", { ascending: true });

      if (error) {
        console.error("Greška pri učitavanju salona:", error);
      }

      setSalons(data || []);

      // Välj staden som kunden valde förra gången, om det fortfarande finns salonger där.
      try {
        const savedCity = localStorage.getItem(SAVED_CITY_KEY);
        if (savedCity && (data || []).some((salon) => salon.city === savedCity)) {
          setSelectedCity(savedCity);
        }
      } catch {
        // Inget sparat eller sparande är avstängt. Då visas alla städer.
      }
      setLoading(false);

      // Hämta bara det som gäller i dag, för "Otvoreno danas" på korten.
      const [shortenedResult, closedResult] = await Promise.all([
        supabase
          .from("salon_shortened_hours")
          .select("salon_id, start_time, end_time")
          .eq("weekday", WEEKDAY_CODES[new Date().getDay()]),
        supabase
          .from("closed_days")
          .select("salon_id")
          .eq("date", todayDateString())
          .is("barber_id", null),
      ]);

      const shortened: Record<number, { start_time: string; end_time: string }> = {};
      (shortenedResult.data || []).forEach((row) => {
        shortened[row.salon_id] = row;
      });
      setTodayShortenedHours(shortened);
      setClosedTodayIds((closedResult.data || []).map((row) => row.salon_id));
    }

    loadSalons();
  }, []);

  return (
    <main
      style={{
        padding: isDesktop ? `20px ${desktopGutter}px` : 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Mörk bakgrund bakom kategoripanelen. Ett tryck här stänger panelen. */}
      <div
        onClick={() => setCategoryMenuOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: "rgba(0, 0, 0, 0.4)",
          opacity: categoryMenuOpen ? 1 : 0,
          pointerEvents: categoryMenuOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Kategoripanelen som glider in från vänster. */}
      <nav
        aria-label="Kategorije"
        className={sourceSans.className}
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 61,
          width: "82%",
          maxWidth: 320,
          background: "#ffffff",
          boxShadow: categoryMenuOpen ? "4px 0 20px rgba(0, 0, 0, 0.15)" : "none",
          transform: categoryMenuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid #eeeeee",
          }}
        >
          <span
            className={dmSerif.className}
            style={{ fontSize: 22, color: "#1f1f1f" }}
          >
            Kategorije
          </span>
          <button
            type="button"
            onClick={() => setCategoryMenuOpen(false)}
            aria-label="Zatvori"
            style={{
              display: "flex",
              border: "none",
              padding: 4,
              background: "transparent",
              color: "#1f1f1f",
              cursor: "pointer",
            }}
          >
            <FiX size={24} />
          </button>
        </div>

        {[{ name: null, label: "Sve kategorije", icon: FiGrid as IconType },
          ...CATEGORIES.map((c) => ({ name: c.name, label: c.name, icon: c.icon })),
        ].map(({ name, label, icon: Icon }) => {
          const isSelected = selectedCategory === name;
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                chooseCategory(name);
                setCategoryMenuOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                padding: "14px 20px",
                border: "none",
                borderBottom: "1px solid #f3f4f6",
                background: isSelected ? "#fbf5f5" : "#ffffff",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  borderRadius: 999,
                  background: isSelected ? "#611a1a" : "#f8eeee",
                  color: isSelected ? "#ffffff" : "#611a1a",
                }}
              >
                <Icon size={20} />
              </span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: isSelected ? 700 : 600,
                  color: isSelected ? "#611a1a" : "#1f1f1f",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {showStickySearch && (
        <div
          className={sourceSans.className}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            background: "#ffffff",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
          }}
        >
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Salonix"
            style={{
              width: 30,
              height: 30,
              flexShrink: 0,
              overflow: "hidden",
              border: "none",
              padding: 0,
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <img
              src="/salonix-horisontell-maroon.png"
              alt=""
              style={{ height: 30, width: "auto", maxWidth: "none", display: "block" }}
            />
          </button>

          <button
            type="button"
            onClick={() => setCategoryMenuOpen(true)}
            aria-label="Kategorije"
            style={{
              display: "flex",
              flexShrink: 0,
              border: "none",
              padding: 4,
              background: "transparent",
              color: "#1f1f1f",
              cursor: "pointer",
            }}
          >
            <FiMenu size={24} />
          </button>

          <label
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 14px",
              height: 40,
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              background: "#ffffff",
            }}
          >
            <FiSearch size={17} color="#1f1f1f" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Šta želite rezervisati?"
              style={{
                flex: 1,
                minWidth: 0,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 16,
                color: "#1f1f1f",
              }}
            />
          </label>
        </div>
      )}

      {/* ---------- DESKTOP: vinröd topp med logga, slogan och sökrad ---------- */}
      {isDesktop && (
        <section
          style={{
            margin: `-20px -${desktopGutter}px 48px`,
            padding: `44px ${desktopGutter}px 52px`,
            background: "#611a1a",
            textAlign: "center",
          }}
        >
          <img
            src="/salonix-logo-ljus.png"
            alt="Salonix – Brže | Lakše | Online"
            style={{ width: 220, height: "auto", display: "block", margin: "0 auto" }}
          />

          <h1
            className={dmSerif.className}
            style={{
              fontSize: 36,
              lineHeight: 1.2,
              color: "#ffffff",
              margin: "32px 0 0",
            }}
          >
            Sve za vašu ljepotu
          </h1>

          {/* Sök och stad i en rad, med knappen "Pretraži". */}
          <div
            ref={desktopHeroSearchRef}
            className={sourceSans.className}
            style={{
              display: "flex",
              alignItems: "center",
              maxWidth: 780,
              height: 60,
              margin: "24px auto 0",
              padding: "0 8px 0 22px",
              borderRadius: 999,
              background: "#ffffff",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
              textAlign: "left",
            }}
          >
            <label style={{ flex: 1.4, display: "flex", alignItems: "center", gap: 10 }}>
              <FiSearch size={20} color="#1f1f1f" style={{ flexShrink: 0 }} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Šta želite rezervisati?"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 16,
                  color: "#1f1f1f",
                }}
              />
            </label>

            <span style={{ width: 1, height: 30, background: "#e5e7eb", margin: "0 18px" }} />

            <label
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: "100%",
              }}
            >
              <FiMapPin size={20} color="#1f1f1f" style={{ flexShrink: 0 }} />
              <select
                value={selectedCity ?? ""}
                onChange={(e) => chooseCity(e.target.value || null)}
                aria-label="Grad"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  appearance: "none",
                  WebkitAppearance: "none",
                  fontSize: 16,
                  color: selectedCity ? "#1f1f1f" : "#6b7280",
                  cursor: "pointer",
                }}
              >
                <option value="">Svi gradovi</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <FiChevronDown
                size={18}
                color="#6b7280"
                style={{ flexShrink: 0, pointerEvents: "none", marginRight: 12 }}
              />
            </label>

            <button
              type="button"
              onClick={() => setScrollRequest((n) => n + 1)}
              style={{
                flexShrink: 0,
                height: 46,
                padding: "0 28px",
                borderRadius: 999,
                border: "none",
                background: "#611a1a",
                color: "#ffffff",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Pretraži
            </button>
          </div>
        </section>
      )}

      {/* ---------- MOBIL (fryst): logga överst och vinröd topp ---------- */}
      {!isDesktop && (
      <>
      <header style={{ marginBottom: 24 }}>
        <img
          src="/salonix-horisontell-maroon.png"
          alt="Salonix"
          style={{ height: 34, width: "auto", display: "block" }}
        />
      </header>

      <section
        style={{
          margin: "0 -20px 28px",
          padding: "32px 20px 28px",
          background: "#611a1a",
        }}
      >
        <h1
          className={dmSerif.className}
          style={{ fontSize: 26, lineHeight: 1.2, color: "#ffffff", margin: 0 }}
        >
          Sve za vašu ljepotu
        </h1>

        <label
          ref={heroSearchRef}
          className={sourceSans.className}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 20,
            padding: "0 18px",
            height: 50,
            borderRadius: 999,
            background: "#ffffff",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.18)",
          }}
        >
          <FiSearch size={20} color="#1f1f1f" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Šta želite rezervisati?"
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 16,
              color: "#1f1f1f",
            }}
          />
        </label>

        {/* Välj stad. Telefonen visar sin egen lista när man trycker. */}
        <label
          className={sourceSans.className}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 10,
            padding: "0 18px",
            height: 50,
            borderRadius: 999,
            background: "#ffffff",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.18)",
          }}
        >
          <FiMapPin size={20} color="#1f1f1f" />
          <select
            value={selectedCity ?? ""}
            onChange={(e) => chooseCity(e.target.value || null)}
            aria-label="Grad"
            style={{
              flex: 1,
              minWidth: 0,
              height: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              appearance: "none",
              WebkitAppearance: "none",
              fontSize: 16,
              color: selectedCity ? "#1f1f1f" : "#6b7280",
              cursor: "pointer",
            }}
          >
            <option value="">Svi gradovi</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <FiChevronDown
            size={18}
            color="#6b7280"
            style={{ flexShrink: 0, pointerEvents: "none" }}
          />
        </label>
      </section>
      </>
      )}

      <h2
        className={dmSerif.className}
        style={{ fontSize: 22, color: "#1f1f1f", marginBottom: 12 }}
      >
        Kategorije
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: isDesktop ? 18 : 12,
          // Extra luft så att kunden först väljer kategori innan salongerna börjar.
          marginBottom: isDesktop ? 64 : 48,
        }}
      >
        {CATEGORIES.map(({ name, icon: Icon, image }) => {
          const isSelected = selectedCategory === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => chooseCategory(isSelected ? null : name)}
              className={sourceSans.className}
              style={{
                position: "relative",
                height: isDesktop ? 280 : 150,
                padding: 0,
                overflow: "hidden",
                borderRadius: 14,
                border: "none",
                // Vald kategori får en vinröd ram runt bilden.
                outline: isSelected ? "3px solid #611a1a" : "none",
                outlineOffset: 2,
                backgroundColor: "#f5eded",
                backgroundImage: image ? `url(${image})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                cursor: "pointer",
              }}
            >
              {/* Kategorier utan bild visar sin ikon tills det finns en bild. */}
              {!image && (
                <span
                  style={{
                    position: "absolute",
                    top: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "#611a1a",
                  }}
                >
                  <Icon size={34} />
                </span>
              )}

              {/* Mörk skugga nertill så att den vita texten går att läsa på bilden. */}
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "flex-end",
                  padding: isDesktop ? "18px 22px" : "10px 12px",
                  background: image
                    ? "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0) 100%)"
                    : "none",
                  color: image ? "#ffffff" : "#611a1a",
                  fontSize: isDesktop ? 24 : 16,
                  fontWeight: 700,
                  textAlign: "left",
                  lineHeight: 1.2,
                }}
              >
                {name}
              </span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
      <h2
        ref={salonsHeadingRef}
        className={dmSerif.className}
        style={{
          fontSize: 22,
          color: "#1f1f1f",
          margin: 0,
          // Plats för den vita listen högst upp.
          scrollMarginTop: 76,
        }}
      >
        Saloni{" "}
        {/* Antalet visas bara när en stad är vald, aldrig totalt för hela Salonix. */}
        {!loading && selectedCity && (
          <span
            className={sourceSans.className}
            style={{ fontSize: 15, color: "#9ca3af" }}
          >
            ({filteredSalons.length})
          </span>
        )}
      </h2>

        {/* Växla mellan lista och karta. */}
        <button
          type="button"
          onClick={() => setShowMap((value) => !value)}
          className={sourceSans.className}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            flexShrink: 0,
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid #611a1a",
            background: showMap ? "#611a1a" : "#ffffff",
            color: showMap ? "#ffffff" : "#611a1a",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {showMap ? <FiList size={16} /> : <FiMap size={16} />}
          {showMap ? "Lista" : "Karta"}
        </button>
      </div>

      {/* Ordning (bara en åt gången) och filtret "Otvoreno danas". Går att scrolla i sidled. */}
      <div
        className={sourceSans.className}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          margin: isDesktop ? "0 0 12px" : "0 -20px 12px",
          padding: isDesktop ? "2px 0" : "2px 20px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {[
          {
            key: "recommended",
            label: "Preporučeno",
            icon: FiThumbsUp,
            onClick: () => setSortMode("recommended"),
          },
          {
            key: "newest",
            label: "Novi saloni",
            icon: FiStar,
            onClick: () => setSortMode("newest"),
          },
          {
            key: "nearest",
            label: locationStatus === "loading" ? "Tražim lokaciju…" : "Najbliže meni",
            icon: FiNavigation,
            onClick: chooseNearest,
          },
        ].map(({ key, label, icon: Icon, onClick }) => {
          const isActive =
            sortMode === key && (key !== "nearest" || !!userLocation);
          return (
            <button
              key={key}
              type="button"
              onClick={onClick}
              aria-pressed={isActive}
              disabled={key === "nearest" && locationStatus === "loading"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
                padding: "6px 12px",
                borderRadius: 999,
                border: isActive ? "1px solid #611a1a" : "1px solid #e5e7eb",
                background: isActive ? "#611a1a" : "#ffffff",
                color: isActive ? "#ffffff" : "#1f1f1f",
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setOpenTodayOnly((value) => !value)}
          aria-pressed={openTodayOnly}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            padding: "6px 12px",
            borderRadius: 999,
            border: openTodayOnly ? "1px solid #15803d" : "1px solid #e5e7eb",
            background: openTodayOnly ? "#15803d" : "#ffffff",
            color: openTodayOnly ? "#ffffff" : "#1f1f1f",
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          <FiClock size={14} />
          Otvoreno danas
          {openTodayOnly && <FiX size={15} />}
        </button>
      </div>

      {/* Det kunden har valt. Ett tryck på ✕ tar bort just det valet. */}
      {(selectedCity || selectedCategory || search.trim()) && (
      <div
        className={sourceSans.className}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >

          {[
            selectedCity && {
              key: "city",
              label: selectedCity,
              icon: FiMapPin,
              onRemove: () => chooseCity(null),
            },
            selectedCategory && {
              key: "category",
              label: selectedCategory,
              icon: CATEGORIES.find((c) => c.name === selectedCategory)?.icon,
              onRemove: () => setSelectedCategory(null),
            },
            search.trim() && {
              key: "search",
              label: `„${search.trim()}“`,
              icon: FiSearch,
              onRemove: () => setSearch(""),
            },
          ]
            .filter((chip) => !!chip)
            .map(({ key, label, icon: Icon, onRemove }) => (
              <button
                key={key}
                type="button"
                onClick={onRemove}
                aria-label={`Ukloni ${label}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px 6px 12px",
                  borderRadius: 999,
                  border: "1px solid #ead9d9",
                  background: "#f8eeee",
                  color: "#611a1a",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {Icon && <Icon size={14} />}
                {label}
                <FiX size={15} />
              </button>
            ))}

          <button
            type="button"
            onClick={() => {
              chooseCity(null);
              setSelectedCategory(null);
              setSearch("");
              setOpenTodayOnly(false);
            }}
            style={{
              border: "none",
              padding: "6px 4px",
              background: "transparent",
              color: "#6b7280",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Očisti sve
          </button>
      </div>
      )}

      {loading && <p>Učitavanje...</p>}

      {!loading && filteredSalons.length === 0 && <p>Nema pronađenih salona.</p>}

      {showMap && !loading && mapSalons.length > 0 && <SalonMap salons={mapSalons} />}

      {!showMap && filteredSalons.map((salon) => {
        // Visa "Studio, Tuzla" men inte "Mercator centar, Tuzla, Tuzla".
        const location =
          salon.address && salon.city && !normalize(salon.address).includes(normalize(salon.city))
            ? `${salon.address}, ${salon.city}`
            : salon.address || salon.city;

        const { isClosedToday, todayHours } = getTodayStatus(
          salon,
          todayShortenedHours,
          closedTodayIds
        );

        return (
        <Link
          key={salon.id}
          href={`/${salon.slug}`}
          style={{
            display: "block",
            marginBottom: 16,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid #ececec",
            background: "#ffffff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              position: "relative",
              height: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5eded",
              backgroundImage: salon.image_url ? `url(${salon.image_url})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {salon.categories?.length > 0 && (
              <div
                className={sourceSans.className}
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {salon.categories.slice(0, 2).map((category: string) => (
                  <span
                    key={category}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "#ffffff",
                      color: "#611a1a",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            {/* Salonger utan bild visar Salonix-ikonen i stället för en tom ruta. */}
            {!salon.image_url && (
              <div style={{ width: 48, height: 48, overflow: "hidden", opacity: 0.85 }}>
                <img
                  src="/salonix-horisontell-maroon.png"
                  alt=""
                  style={{ height: 48, width: "auto", maxWidth: "none", display: "block" }}
                />
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 14px 14px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                className={dmSerif.className}
                style={{ fontSize: 22, color: "#1f1f1f", lineHeight: 1.2 }}
              >
                {salon.salon_name}
              </div>

              {location && (
                <div
                  className={sourceSans.className}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 14,
                    color: "#6b7280",
                    marginTop: 6,
                  }}
                >
                  <FiMapPin size={14} style={{ flexShrink: 0 }} />
                  {location}
                  {salon.distanceKm != null && (
                    <span style={{ fontWeight: 600, color: "#611a1a", whiteSpace: "nowrap" }}>
                      · {formatDistance(salon.distanceKm)}
                    </span>
                  )}
                </div>
              )}

              {(isClosedToday || todayHours) && (
                <div
                  className={sourceSans.className}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    color: isClosedToday ? "#9ca3af" : "#15803d",
                    marginTop: 4,
                  }}
                >
                  <FiClock size={14} style={{ flexShrink: 0 }} />
                  {isClosedToday ? "Zatvoreno danas" : `Otvoreno danas · ${todayHours}`}
                </div>
              )}
            </div>

            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 38,
                height: 38,
                flexShrink: 0,
                borderRadius: 999,
                background: "#611a1a",
                color: "#ffffff",
              }}
            >
              <FiArrowRight size={18} />
            </span>
          </div>
        </Link>
        );
      })}

      <footer
        className={sourceSans.className}
        style={{
          margin: isDesktop
            ? `40px -${desktopGutter}px -20px`
            : "40px -20px -20px",
          padding: isDesktop ? `28px ${desktopGutter}px 32px` : "28px 20px 32px",
          background: "#faf6f6",
          borderTop: "1px solid #f0e6e6",
        }}
      >
        <img
          src="/salonix-horisontell-maroon.png"
          alt="Salonix"
          style={{ height: 28, width: "auto", display: "block" }}
        />
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.5,
            color: "#6b7280",
            margin: "12px 0 0",
          }}
        >
          Pronađite salon i rezervišite termin online – brzo i jednostavno.
        </p>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: "20px 0 0" }}>
          © {new Date().getFullYear()} Salonix · salonix.ba
        </p>
      </footer>
    </main>
  );
}