"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import { FiSearch } from "react-icons/fi";
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const searchTerm = normalize(search.trim());
  const filteredSalons = salons.filter((salon) => {
    if (
      selectedCategory &&
      !(salon.categories || []).some(
        (category: string) => normalize(category) === normalize(selectedCategory)
      )
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
  });

  useEffect(() => {
    async function loadSalons() {
      const { data, error } = await supabase
        .from("salons")
        .select("id, salon_name, slug, city, categories, address, image_url")
        .eq("is_published", true)
        .order("salon_name", { ascending: true });

      if (error) {
        console.error("Greška pri učitavanju salona:", error);
      }

      setSalons(data || []);
      setLoading(false);
    }

    loadSalons();
  }, []);

  return (
    <main style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
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
              onClick={() => setSelectedCategory(isSelected ? null : name)}
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
        className={dmSerif.className}
        style={{ fontSize: 22, color: "#1f1f1f", marginBottom: 12 }}
      >
        Saloni{" "}
        {!loading && (
          <span
            className={sourceSans.className}
            style={{ fontSize: 15, color: "#9ca3af" }}
          >
            ({filteredSalons.length})
          </span>
        )}
      </h2>

      {loading && <p>Učitavanje...</p>}

      {!loading && filteredSalons.length === 0 && <p>Nema pronađenih salona.</p>}

            {filteredSalons.map((salon) => (
        <Link
          key={salon.id}
          href={`/${salon.slug}`}
          style={{
            display: "block",
            marginBottom: 16,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid #eeeeee",
            background: "#ffffff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              height: 150,
              backgroundColor: "#f5eded",
              backgroundImage: salon.image_url ? `url(${salon.image_url})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div style={{ padding: "14px 16px 16px" }}>
            <div
              className={dmSerif.className}
              style={{ fontSize: 22, color: "#1f1f1f", lineHeight: 1.2 }}
            >
              {salon.salon_name}
            </div>

            {salon.categories.length > 0 && (
              <div
                className={sourceSans.className}
                style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}
              >
                {salon.categories.slice(0, 3).map((category: string) => (
                  <span
                    key={category}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: "#f8eeee",
                      color: "#611a1a",
                    }}
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            <div
              className={sourceSans.className}
              style={{ fontSize: 14, color: "#6b7280", marginTop: 10 }}
            >
              {[salon.city, salon.address].filter(Boolean).join(" · ")}
            </div>
          </div>
        </Link>
      ))}
    </main>
  );
}