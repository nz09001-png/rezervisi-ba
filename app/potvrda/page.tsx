"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PotvrdaPage() {
  const searchParams = useSearchParams();

  const salon = searchParams.get("salon");
  const serviceId = searchParams.get("serviceId");
  const time = searchParams.get("time");
  const ime = searchParams.get("ime");
  const prezime = searchParams.get("prezime");
  const phoneCode = searchParams.get("phoneCode");
  const phone = searchParams.get("phone");
  const email = searchParams.get("email");
  const napomena = searchParams.get("napomena");
  const [service, setService] = useState<any>(null);

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

  return (
    <main className="min-h-screen bg-white px-8 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-950">
            Potvrda rezervacije
          </h1>
          <div className="mt-4 h-1.5 w-24 bg-[#611a1a]" />
        </div>
        <div className="mb-10 flex justify-end">
  <div className="flex items-center gap-2">
    {[
      { nr: "1", label: "USLUGA", active: true },
      { nr: "2", label: "VRIJEME", active: true },
      { nr: "3", label: "PODACI", active: true },
      { nr: "4", label: "POTVRDA", active: true },
    ].map((step, index) => (
      <div key={step.nr} className="flex items-center gap-4">

        <div className="flex flex-col items-center">
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              backgroundColor: "#611a1a",
              color: "white",
            }}
          >
            {step.nr}
          </div>

          <p className="mt-1 text-[11px] font-semibold tracking-wide text-[#611a1a]">
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
</div>

        <div className="mx-auto mb-8 grid max-w-xl grid-cols-3 gap-4">
  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center">
    <p className="text-sm font-bold text-[#611a1a]">
      SALON
    </p>
    <p className="mt-2 font-bold">
      {salon}
    </p>
  </div>

  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center">
    <p className="text-sm font-bold text-[#611a1a]">
      USLUGA
    </p>
    <p className="mt-2 font-bold">
  {service ? `${service.name} - ${service.price} KM` : "Učitava se..."}
</p>
  </div>

  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center">
    <p className="text-sm font-bold text-[#611a1a]">
      VRIJEME
    </p>
    <p className="mt-2 font-bold">
      {time}
    </p>
  </div>
</div>

        <div className="mx-auto max-w-xl rounded-3xl border border-[#611a1a] bg-white p-6 shadow-sm">
  <h2 className="mb-8 text-xl font-bold text-[#611a1a]">
  Podaci korisnika
</h2>

<div className="mx-auto" style={{ width: "290px" }}>
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

<div className="mt-10 flex justify-center">
    <button
      type="button"
      style={{
        backgroundColor: "#611a1a",
        color: "white",
        padding: "16px 80px",
        borderRadius: "16px",
        fontWeight: "bold",
      }}
    >
      Potvrdi rezervaciju
    </button>
  </div>
</div>
      </div>
    </main>
  );
}