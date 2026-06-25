"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function TimesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const salon = searchParams.get("salon");
  const serviceId = searchParams.get("serviceId");
  const [service, setService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  

  function handleContinue() {
  if (!selectedTime) return;

  router.push(
    `/podaci?salon=${encodeURIComponent(salon || "")}&serviceId=${serviceId}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`
  );
}
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
    <div className="mx-auto max-w-7xl">
      {service && (
        <div className="mb-6 flex w-fit items-center gap-4 rounded-2xl bg-gray-50 px-5 py-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#611a1a] text-2xl text-white">
            
          </div>

          <div>
            <p className="text-1xl font-bold">{service.name}</p>
            <p className="text-gray-600">
              {service.price} KM • {service.duration_minutes || 60} min
            </p>
          </div>
        </div>
      )}

      <div className="mb-10 flex items-end justify-between gap-8">
  <div>
    <h1 className="text-2xl font-bold text-gray-950">
      Odaberi termin
    </h1>
    <div className="mt-4 h-1.5 w-24 bg-[#611a1a]" />
  </div>

  <div className="flex items-center gap-2">
    {[
      { nr: "1", label: "USLUGA", active: true },
      { nr: "2", label: "VRIJEME", active: true },
      { nr: "3", label: "PODACI", active: false },
      { nr: "4", label: "POTVRDA", active: false },
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
              backgroundColor: step.active ? "#611a1a" : "white",
              color: step.active ? "white" : "#6b7280",
              border: step.active ? "none" : "1px solid #d1d5db",
            }}
          >
            {step.nr}
          </div>

          <p
            className={`mt-1 text-[11px] font-semibold tracking-wide ${
              step.active ? "text-[#611a1a]" : "text-gray-500"
            }`}
          >
            {step.label}
          </p>
        </div>

        {index < 3 && (
  <div
    style={{
      width: "15px",
      height: "1px",
      backgroundColor: index === 0 ? "#611a1a" : "#d1d5db",
      marginBottom: "24px",
    }}
  />
)}
      </div>
    ))}
  </div>
</div>

      <div
        className="overflow-hidden rounded-3xl"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          border: "1px solid #611a1a",
          backgroundColor: "#ffffff",
        }}
      >
        {[
          { day: "Pon", date: "23" },
          { day: "Uto", date: "24" },
          { day: "Sri", date: "25" },
          { day: "Čet", date: "26" },
          { day: "Pet", date: "27" },
          { day: "Sub", date: "28" },
          { day: "Ned", date: "29" },
        ].map((item) => (
          <div
            key={item.day}
            className="min-h-[360px] border-r border-gray-200 bg-white last:border-r-0"
          >
            <div className="border-b border-gray-200 bg-white p-4 text-center">
              <p className="text-lg font-semibold text-[#611a1a]">
                {item.day}
              </p>

              <p className="text-4xl font-bold text-[#611a1a]">
                {item.date}
              </p>
            </div>

            <div className="space-y-3 p-4">
              {item.day === "Ned" ? (
                <p className="pt-10 text-center text-lg font-medium italic text-[#611a1a]">
                  Nema termina
                </p>
              ) : (
                ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map(
                  (time) => (
                    <button
  key={time}
  type="button"
  onClick={() => {
  setSelectedDate(item.date);
  setSelectedTime(`${item.day}-${time}`);
}}
  style={{
    backgroundColor:
      selectedTime === `${item.day}-${time}`
        ? "#611a1a"
        : "#ffffff",
    color:
      selectedTime === `${item.day}-${time}`
        ? "#ffffff"
        : "#611a1a",
    border: "1px solid #611a1a",
  }}
  className="w-full rounded-xl py-2 font-bold"
>
  {time}
</button>
                  )
                )
              )}
            </div>
          </div>
        ))}
                  </div>

      <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    marginTop: "24px",
  }}
>
  <button
    type="button"
    disabled={!selectedTime}
    onClick={handleContinue}
    style={{
      backgroundColor: selectedTime ? "#611a1a" : "#e5e7eb",
      color: selectedTime ? "#ffffff" : "#9ca3af",
      padding: "12px 40px",
      borderRadius: "16px",
      fontWeight: "700",
    }}
  >
    Nastavi
  </button>
</div>

    </div>
  </main>
);
}

export default function TimesPage() {
  return (
    <Suspense fallback={<div>Laddar...</div>}>
      <TimesContent />
    </Suspense>
  );
}