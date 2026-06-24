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
        
  <div
  className="mx-auto mb-8 max-w-xl py-2"
  style={{
    borderTop: "1px solid #611a1a",
    borderBottom: "1px solid #611a1a",
  }}
>
  <div
    style={{
      borderBottom: "1px solid #611a1a",
      padding: "12px 0",
    }}
  >
    <p className="text-sm font-bold text-[#611a1a]">
      Salon:
    </p>
    <p className="font-semibold">
      {salon}
    </p>
  </div>

  <div
    style={{
      borderBottom: "1px solid #611a1a",
      padding: "12px 0",
    }}
  >
    <p className="text-sm font-bold text-[#611a1a]">
      Usluga:
    </p>
    <p className="font-semibold">
      {service ? `${service.name} - ${service.price} KM` : "Učitava se..."}
    </p>
  </div>

  <div style={{ padding: "12px 0" }}>
    <p className="text-sm font-bold text-[#611a1a]">
      Vrijeme:
    </p>
    <p className="font-semibold">
      {time}
    </p>
  </div>
</div>
<div
  className="mx-auto mb-6 flex max-w-xl justify-end"
  style={{ transform: "translateX(200px)" }}
>
  <div className="flex items-center gap-2">
    {[
      { nr: "1", label: "USLUGA" },
      { nr: "2", label: "VRIJEME" },
      { nr: "3", label: "PODACI" },
      { nr: "4", label: "POTVRDA" },
    ].map((step, index) => (
      <div key={step.nr} className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "bold",
              backgroundColor: "#611a1a",
              color: "white",
            }}
          >
            {step.nr}
          </div>

          <p className="mt-1 text-[10px] font-semibold tracking-wide text-[#611a1a]">
            {step.label}
          </p>
        </div>

        {index < 3 && (
          <div
            style={{
              width: "14px",
              height: "1px",
              backgroundColor: "#611a1a",
              marginBottom: "22px",
            }}
          />
        )}
      </div>
    ))}
  </div>
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