"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function PodaciPage() {

  const searchParams = useSearchParams();
  const router = useRouter();

  const salon = searchParams.get("salon");
const salonSlug = searchParams.get("salonSlug");
const serviceId = searchParams.get("serviceId");
const date = searchParams.get("date");
const time = searchParams.get("time");
const barberId = searchParams.get("barberId");
  const [service, setService] = useState<any>(null);
  const [ime, setIme] = useState("");
const [prezime, setPrezime] = useState("");
const [phoneCode, setPhoneCode] = useState("+387");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [napomena, setNapomena] = useState("");
const handleNext = () => {
  if (!ime.trim() || !prezime.trim() || !phone.trim()) {
    alert("Molimo unesite ime, prezime i broj telefona.");
    return;
  }

  const cleanedPhone = phone.replace(/\s+/g, "");

if (!/^\d{6,15}$/.test(cleanedPhone)) {
  alert("Molimo unesite ispravan broj telefona.");
  return;
}

  if (
  email.trim() &&
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
) {
  alert("Molimo unesite ispravnu email adresu.");
  return;
}

  const params = new URLSearchParams({
  salon: salon || "",
  salonSlug: salonSlug || "",
  serviceId: serviceId || "",
  date: date || "",
  time: time || "",
  barberId: barberId || "",
  ime,
  prezime,
  phoneCode,
  phone,
  email,
  napomena,
});

  router.push(`/potvrda?${params.toString()}`);
};

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
      <Link
  href={`/times?salon=${encodeURIComponent(
    salon || ""
  )}&salonSlug=${encodeURIComponent(
    salonSlug || ""
  )}&serviceId=${serviceId}`}
  style={{
    color: "#611a1a",
    textDecoration: "none",
    fontWeight: "700",
    display: "inline-block",
    marginBottom: "16px",
  }}
>
  ← Nazad
</Link>
  <div className="mx-auto max-w-4xl">
    

        <div
  className="flex items-end justify-between"
  style={{
    marginBottom: "16px",
  }}
>

  <div>
    <h1 className="text-3xl font-bold text-gray-950">
      Unesi podatke
    </h1>

    <div className="mt-4 h-1.5 w-24 bg-[#611a1a]" />
  </div>

  <div className="flex items-center gap-2">
    {[
      { nr: "1", label: "USLUGA", active: true },
      { nr: "2", label: "VRIJEME", active: true },
      { nr: "3", label: "PODACI", active: true },
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
              backgroundColor: index < 2 ? "#611a1a" : "#d1d5db",
              marginBottom: "24px",
            }}
          />
        )}

      </div>
    ))}
  </div>

</div>

        <div
  className="mb-4 inline-block rounded-xl border px-5 py-3"
  style={{
    backgroundColor: "rgba(97, 26, 26, 0.03)",
    border: "1px solid rgba(97, 26, 26, 0.15)",
  }}
>
  <p className="font-bold">
    {service ? service.name : "Učitava se..."}
  </p>

  <p className="text-gray-600">
    {service ? `${service.price} KM • ${service.duration_minutes || 60} min` : ""}
  </p>

  <p className="mt-1 text-sm text-[#611a1a] font-medium">
    {time}
  </p>
</div>


        <div className="mx-auto max-w-3xl rounded-3xl border border-[#611a1a] bg-white p-8 shadow-sm">
        <div className="mb-6 grid grid-cols-2 gap-6">

  <div>
    <label
  style={{ color: "#611a1a" }}
  className="mb-2 block font-semibold"
>
  Ime *
</label>

    <input
  type="text"
  value={ime}
  onChange={(e) => setIme(e.target.value)}
  placeholder="Unesite ime"
  className="w-full rounded-xl border border-[#611a1a] p-3"
/>
  </div>

  <div>
    <label
  style={{ color: "#611a1a" }}
  className="mb-2 block font-semibold"
>
  Prezime *
</label>

    <input
  type="text"
  value={prezime}
  onChange={(e) => setPrezime(e.target.value)}
  placeholder="Unesite prezime"
  className="w-full rounded-xl border border-[#611a1a] p-3"
/>
  </div>

</div>

<div className="mb-6">
  <label
  style={{ color: "#611a1a" }}
  className="mb-2 block font-semibold"
>
  Telefon *
</label>

  <div className="flex gap-3">
    <select
  value={phoneCode}
  onChange={(e) => setPhoneCode(e.target.value)}
  className="w-40 rounded-xl border border-[#611a1a] px-4 py-3"
>
  <option value="+387">🇧🇦 +387</option>
  <option value="+385">🇭🇷 +385</option>
  <option value="+381">🇷🇸 +381</option>
  <option value="+382">🇲🇪 +382</option>
  <option value="+386">🇸🇮 +386</option>
  <option value="+46">🇸🇪 +46</option>
  <option value="+47">🇳🇴 +47</option>
  <option value="+45">🇩🇰 +45</option>
  <option value="+49">🇩🇪 +49</option>
  <option value="+43">🇦🇹 +43</option>
  <option value="+41">🇨🇭 +41</option>
</select>

    <input
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder="Primjer: 061 234 567"
  className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-[#611a1a] focus:ring-2 focus:ring-[#611a1a]/20"
/>
  </div>
  <p
  style={{
    fontSize: "13px",
    color: "#666",
    marginTop: "8px",
  }}
>
  Unesite broj telefona kako biste primili potvrdu rezervacije i podsjetnike.
</p>
</div>

<div className="mb-6">
  <label
  style={{ color: "#611a1a" }}
  className="mb-2 block font-semibold"
>
  Email
</label>

  <input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder= "Unesite email adresu ako želite primiti potvrdu i putem emaila."
  className="w-full rounded-xl border border-[#611a1a] p-3"
/>
</div>

<div className="mb-6">
  <label
  style={{ color: "#611a1a" }}
  className="mb-2 block font-semibold"
>
  Napomena
</label>

  <textarea
  value={napomena}
  onChange={(e) => setNapomena(e.target.value)}
  placeholder="Dodatne informacije..."
  rows={4}
  className="w-full rounded-xl border border-[#611a1a] p-3"
/>
</div>

<div className="mt-8 flex justify-end">
  <button
    type="button"
    onClick={handleNext}
    style={{
      backgroundColor: "#611a1a",
      color: "white",
      padding: "14px 40px",
      borderRadius: "16px",
      fontWeight: "bold",
    }}
  >
    Nastavi
  </button>
</div>
</div>


      </div>
    </main>
  );
}