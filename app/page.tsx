"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { DM_Serif_Display, Source_Sans_3 } from "next/font/google";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
});

export default function Home() {
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      <section style={{ marginBottom: 28 }}>
        <h1
          className={dmSerif.className}
          style={{ fontSize: 30, lineHeight: 1.15, color: "#1f1f1f", margin: 0 }}
        >
          Pronađi salon i rezerviši termin
        </h1>
        <p
          className={sourceSans.className}
          style={{ fontSize: 16, color: "#6b7280", marginTop: 10, lineHeight: 1.45 }}
        >
          Frizerski saloni, barberi, nokti, kozmetika i još mnogo toga – na
          jednom mjestu.
        </p>
      </section>

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
            ({salons.length})
          </span>
        )}
      </h2>

      {loading && <p>Učitavanje...</p>}

      {!loading && salons.length === 0 && <p>Nema pronađenih salona.</p>}

            {salons.map((salon) => (
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