"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
} from "react-icons/fi";
import { TbScissors, TbMassage, TbFlower, TbHandStop } from "react-icons/tb";
import { GiEyelashes, GiLipstick } from "react-icons/gi";
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
const CATEGORIES: { name: string; icon: IconType }[] = [
  { name: "Frizura", icon: TbScissors },
  { name: "Masaža", icon: TbMassage },
  { name: "Nokti", icon: TbHandStop },
  { name: "Trepavice i obrve", icon: GiEyelashes },
  { name: "Njega lica", icon: TbFlower },
  { name: "Ljepota", icon: GiLipstick },
];

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
  const heroSearchRef = useRef<HTMLLabelElement>(null);
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
  useEffect(() => {
    const heroSearch = heroSearchRef.current;
    if (!heroSearch) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowStickySearch(entry.boundingClientRect.bottom < 0);
    });
    observer.observe(heroSearch);
    return () => observer.disconnect();
  }, []);

  const searchTerm = normalize(search.trim());
  const matchesCategory = (salon: any) =>
    !selectedCategory ||
    (salon.categories || []).some(
      (category: string) => normalize(category) === normalize(selectedCategory)
    );

  const filteredSalons = salons.filter((salon) => {
    if (!matchesCategory(salon)) return false;
    if (selectedCity && salon.city !== selectedCity) return false;
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
  });

  useEffect(() => {
    async function loadSalons() {
      const { data, error } = await supabase
        .from("salons")
        .select(
          "id, salon_name, slug, city, categories, address, image_url, opening_hours, closed_weekdays"
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
    <main style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
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
          gap: 10,
          marginBottom: 28,
        }}
      >
        {CATEGORIES.map(({ name, icon: Icon }) => {
          const isSelected = selectedCategory === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => chooseCategory(isSelected ? null : name)}
              className={sourceSans.className}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "16px 8px",
                borderRadius: 14,
                border: isSelected ? "1.5px solid #611a1a" : "1px solid #eeeeee",
                background: isSelected ? "#fbf5f5" : "#ffffff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  background: isSelected ? "#611a1a" : "#f8eeee",
                  color: isSelected ? "#ffffff" : "#611a1a",
                }}
              >
                <Icon size={24} />
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1f1f1f" }}>
                {name}
              </span>
            </button>
          );
        })}
      </div>

      <h2
        ref={salonsHeadingRef}
        className={dmSerif.className}
        style={{
          fontSize: 22,
          color: "#1f1f1f",
          marginBottom: 12,
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

      {/* Visar det kunden har valt. Ett tryck på ✕ tar bort just det valet. */}
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

      {filteredSalons.map((salon) => {
        // Visa "Studio, Tuzla" men inte "Mercator centar, Tuzla, Tuzla".
        const location =
          salon.address && salon.city && !normalize(salon.address).includes(normalize(salon.city))
            ? `${salon.address}, ${salon.city}`
            : salon.address || salon.city;

        // Dagens öppettider: stängd dag går före förkortade tider, som går före vanliga tider.
        const shortened = todayShortenedHours[salon.id];
        const isClosedToday =
          closedTodayIds.includes(salon.id) ||
          (salon.closed_weekdays || []).includes(WEEKDAY_CODES[new Date().getDay()]);
        const todayHours = shortened
          ? `${shortened.start_time.slice(0, 5)}–${shortened.end_time.slice(0, 5)}`
          : salon.opening_hours?.replace("-", "–");

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
          margin: "40px -20px -20px",
          padding: "28px 20px 32px",
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