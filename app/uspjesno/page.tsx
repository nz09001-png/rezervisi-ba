"use client";

import { useSearchParams } from "next/navigation";

export default function UspjesnoPage() {
  const searchParams = useSearchParams();

  const salon = searchParams.get("salon");
  const salonSlug = searchParams.get("salonSlug");
  const service = searchParams.get("service");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const email = searchParams.get("email");

  return (
    <main className="min-h-screen bg-white px-8 py-10">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm border-2 border-[#611a1a]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#611a1a] text-3xl text-white">
          ✓
        </div>

        <h1 className="mb-3 text-3xl font-bold text-[#611a1a]">
          Rezervacija uspješna
        </h1>

        <p className="mb-8 text-gray-700">
          Vaš termin je uspješno rezervisan.
        </p>

        <div className="mb-8 text-left">
          <div className="border-b py-3">
            <p className="text-sm font-bold text-[#611a1a]">Salon</p>
            <p className="font-semibold">{salon}</p>
          </div>

          <div className="border-b py-3">
            <p className="text-sm font-bold text-[#611a1a]">Usluga</p>
            <p className="font-semibold">{service}</p>
          </div>

          <div className="border-b py-3">
            <p className="text-sm font-bold text-[#611a1a]">Datum</p>
            <p className="font-semibold">{date}</p>
          </div>

          <div className="border-b py-3">
            <p className="text-sm font-bold text-[#611a1a]">Vrijeme</p>
            <p className="font-semibold">{time}</p>
          </div>
        </div>

        {email && email.trim() && (
          <p className="rounded-2xl bg-[#fff7f7] p-4 text-sm text-[#611a1a]">
            Potvrda rezervacije je poslana na email.
          </p>
        )}
        {salonSlug && (
  <div className="mt-6">
    <button
      type="button"
      onClick={() => {
        window.location.href = `/${salonSlug}`;
      }}
      style={{
        backgroundColor: "#611a1a",
        color: "white",
        padding: "14px 40px",
        borderRadius: "16px",
        fontWeight: "bold",
      }}
    >
      Povratak na salon
    </button>
  </div>
)}
      </div>
    </main>
  );
}