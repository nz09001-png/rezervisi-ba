"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { readCustomerData, saveCustomerData } from "@/lib/customerData";
import { Source_Sans_3, Geist, Montserrat } from "next/font/google";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
});

const geist = Geist({
  subsets: ["latin"],
});

// Rubriker och salongens namn – samma som tidssidan.
const montserrat = Montserrat({
  weight: ["600", "700"],
  subsets: ["latin", "latin-ext"],
});

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
  const [barber, setBarber] = useState<any>(null);
  // Fälten fylls i från flikens minne när kunden kommer tillbaka från /potvrda
  // ("Promijeni" / "← Nazad") – se useEffect nedan och lib/customerData.ts.
  const [ime, setIme] = useState("");
const [prezime, setPrezime] = useState("");
const [phoneCode, setPhoneCode] = useState("+387");
const phonePlaceholders: Record<string, string> = {
  "+387": "Primjer: 061 234 567",
  "+385": "Primjer: 091 234 5678",
  "+381": "Primjer: 064 123 4567",
  "+382": "Primjer: 067 123 456",
  "+386": "Primjer: 041 234 567",
  "+46": "Primjer: 070 123 45 67",
  "+47": "Primjer: 412 34 567",
  "+45": "Primjer: 20 12 34 56",
  "+49": "Primjer: 0151 23456789",
  "+43": "Primjer: 0664 1234567",
  "+41": "Primjer: 079 123 45 67",
};
const phoneCountries: Record<
  string,
  "BA" | "HR" | "RS" | "ME" | "SI" | "SE" | "NO" | "DK" | "DE" | "AT" | "CH"
> = {
  "+387": "BA",
  "+385": "HR",
  "+381": "RS",
  "+382": "ME",
  "+386": "SI",
  "+46": "SE",
  "+47": "NO",
  "+45": "DK",
  "+49": "DE",
  "+43": "AT",
  "+41": "CH",
};
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [napomena, setNapomena] = useState("");

// Sparade uppgifter (från ett tidigare besök på sidan i samma flik) fylls i en gång.
useEffect(() => {
  const saved = readCustomerData();
  setIme(saved.ime);
  setPrezime(saved.prezime);
  if (saved.phoneCode) setPhoneCode(saved.phoneCode);
  setPhone(saved.phone);
  setEmail(saved.email);
  setNapomena(saved.napomena);
}, []);
const [isMobile, setIsMobile] = useState(false);
// Fel som visas i rött under respektive fält (i stället för grå alert-rutor).
const [errors, setErrors] = useState<{
  ime?: string;
  prezime?: string;
  phone?: string;
  email?: string;
}>({});

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

// Samma fältstil som tidigare, men röd ram när fältet har ett fel.
const fieldClass = (hasError: boolean) =>
  `w-full rounded-xl border bg-white px-3.5 py-3 outline-none transition focus:ring-2 ${
    hasError
      ? "border-[#ef4444] ring-1 ring-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]/20"
      : "border-[#d1d5db] focus:border-[#611a1a] focus:ring-[#611a1a]/20"
  }`;

const errorText = (message?: string) =>
  message ? (
    <p
      style={{
        color: "#ef4444",
        fontSize: "13px",
        fontWeight: 600,
        marginTop: "6px",
      }}
    >
      {message}
    </p>
  ) : null;

const handleNext = () => {
  const newErrors: typeof errors = {};

  if (!ime.trim()) newErrors.ime = "Molimo unesite ime.";
  if (!prezime.trim()) newErrors.prezime = "Molimo unesite prezime.";

  const country = phoneCountries[phoneCode];

const parsedPhone = country && phone.trim()
  ? parsePhoneNumberFromString(phone, country)
  : undefined;

if (!phone.trim()) {
  newErrors.phone = "Molimo unesite broj telefona.";
} else if (!parsedPhone || !parsedPhone.isValid()) {
  newErrors.phone = "Molimo unesite ispravan broj telefona.";
}

  if (
  email.trim() &&
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
) {
  newErrors.email = "Molimo unesite ispravnu email adresu.";
}

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0 || !parsedPhone) {
    return;
  }

const normalizedPhone = parsedPhone.number;

  // Kundens uppgifter sparas i flikens minne – adressen får bara bokningens val.
  saveCustomerData({
    ime,
    prezime,
    phoneCode,
    phone,
    normalizedPhone,
    email,
    napomena,
  });

  const params = new URLSearchParams({
  salon: salon || "",
  salonSlug: salonSlug || "",
  serviceId: serviceId || "",
  date: date || "",
  time: time || "",
  barberId: barberId || "",
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

useEffect(() => {
  async function fetchBarber() {
    if (!barberId) return;

    const { data, error } = await supabase
      .from("barbers")
      .select("id, name")
      .eq("id", barberId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setBarber(data);
  }

  fetchBarber();
}, [barberId]);

  // Datum som "Sri, 07.10.2026".
  const formattedDate = date
    ? (() => {
        const [year, month, day] = date.split("-").map(Number);
        const shortDays = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];
        const weekday = shortDays[new Date(year, month - 1, day).getDay()];
        return `${weekday}, ${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
      })()
    : "";

  const labelClass = "mb-1.5 block font-semibold text-[#111827]";

  const factLabel = { margin: 0, color: "#6b7280", fontSize: "13px" };
  const factValue = { margin: 0, color: "#111827", fontSize: "16px", fontWeight: 700 };

  return (
    <main
  className={`${sourceSans.className} min-h-screen bg-white px-3 py-6 md:px-8`}
  style={{ paddingBottom: "110px" }}
>
  <div className="mx-auto w-full" style={{ maxWidth: "860px" }}>
      <Link
  href={`/times?salon=${encodeURIComponent(
    salon || ""
  )}&salonSlug=${encodeURIComponent(
    salonSlug || ""
  )}&serviceId=${serviceId}&barberId=${encodeURIComponent(barberId || "")}&date=${encodeURIComponent(
    date || ""
  )}&time=${encodeURIComponent(time || "")}`}
  style={{
    color: "#611a1a",
    textDecoration: "none",
    fontWeight: "700",
    display: "inline-block",
    marginBottom: "12px",
  }}
>
  ← Nazad
</Link>

  {/* Sammanfattning: salong, tjänst, datum, tid, personal, pris. */}
  <div
    style={{
      width: "100%",
      padding: isMobile ? "14px 16px" : "16px 20px",
      borderRadius: "16px",
      backgroundColor: "#ffffff",
      border: "1px solid #ead1d1",
    }}
  >
    {salon && (
      <p
        className={montserrat.className}
        style={{
          margin: 0,
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "#611a1a",
        }}
      >
        {salon}
      </p>
    )}

    <p style={{ margin: 0, marginTop: "2px", color: "#111827", fontSize: "20px", fontWeight: 700 }}>
      {service ? service.name : "Učitava se..."}
    </p>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 22px",
        marginTop: "8px",
      }}
    >
      <div>
        <p style={factLabel}>Datum</p>
        <p style={factValue}>{formattedDate}</p>
      </div>

      <div>
        <p style={factLabel}>Vrijeme</p>
        <p style={factValue}>{time}</p>
      </div>

      <div>
        <p style={factLabel}>Osoblje</p>
        <p style={factValue}>
          {barberId ? (barber ? barber.name : "Učitava se...") : "Bez preferencije"}
        </p>
      </div>

      {service?.show_price && (
        <div>
          <p style={factLabel}>Cijena</p>
          <p style={factValue}>{service.price} KM</p>
        </div>
      )}
    </div>
  </div>

{/* Stegen med namn – samma på mobil och desktop. */}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "6px",
    margin: "14px 0",
  }}
>
  {[
    { nr: "1", label: "USLUGA", active: true },
    { nr: "2", label: "VRIJEME", active: true },
    { nr: "3", label: "PODACI", active: true },
    { nr: "4", label: "POTVRDA", active: false },
  ].map((step, index) => (
    <div key={step.nr} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
      {index > 0 && (
        <div
          style={{
            width: "16px",
            height: "2px",
            marginTop: "10px",
            backgroundColor: step.active ? "#611a1a" : "#ead1d1",
          }}
        />
      )}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "62px" }}>
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700,
            backgroundColor: step.active ? "#611a1a" : "#ffffff",
            color: step.active ? "#ffffff" : "#9ca3af",
            border: step.active ? "1.5px solid #611a1a" : "1.5px solid #d1d5db",
          }}
        >
          {step.nr}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            color: step.active ? "#611a1a" : "#9ca3af",
          }}
        >
          {step.label}
        </p>
      </div>
    </div>
  ))}
</div>

<h1
  className={montserrat.className}
  style={{
    margin: "0 0 12px",
    fontSize: isMobile ? "20px" : "24px",
    fontWeight: 700,
    letterSpacing: "-0.3px",
    color: "#111827",
  }}
>
  Vaši podaci
</h1>

        <div
  style={{
    border: "1px solid #ead1d1",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    padding: "16px",
  }}
>
<div
  className={isMobile ? "mb-3.5 grid grid-cols-1 gap-3.5" : "mb-3.5 grid grid-cols-2 gap-3.5"}
>

  <div>
    <label className={labelClass}>Ime *</label>

    <input
  type="text"
  value={ime}
  onChange={(e) => {
    setIme(e.target.value);
    setErrors((prev) => ({ ...prev, ime: undefined }));
  }}
  placeholder="Unesite ime"
className={fieldClass(!!errors.ime)}
/>
    {errorText(errors.ime)}
  </div>

  <div>
    <label className={labelClass}>Prezime *</label>

    <input
  type="text"
  value={prezime}
  onChange={(e) => {
    setPrezime(e.target.value);
    setErrors((prev) => ({ ...prev, prezime: undefined }));
  }}
  placeholder="Unesite prezime"
className={fieldClass(!!errors.prezime)}
/>
    {errorText(errors.prezime)}
  </div>

</div>

<div className="mb-3.5">
 <label className={labelClass}>Telefon *</label>

  <div className="flex gap-2">
   <div
  style={{
    position: "relative",
    width: isMobile ? "112px" : "130px",
    flexShrink: 0,
  }}
>
  <select
    value={phoneCode}
    onChange={(e) => {
      setPhoneCode(e.target.value);
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }}
    className="w-full rounded-xl border border-[#d1d5db] bg-white px-3.5 py-3 outline-none transition focus:border-[#611a1a] focus:ring-2 focus:ring-[#611a1a]/20"
    style={{
      appearance: "none",
      WebkitAppearance: "none",
      paddingRight: "30px",
      color: "#111827",
    }}
  >
    <option value="+387">BA +387</option>
    <option value="+385">HR +385</option>
    <option value="+381">RS +381</option>
    <option value="+382">ME +382</option>
    <option value="+386">SI +386</option>
    <option value="+46">SE +46</option>
    <option value="+47">NO +47</option>
    <option value="+45">DK +45</option>
    <option value="+49">DE +49</option>
    <option value="+43">AT +43</option>
    <option value="+41">CH +41</option>
  </select>

  <span
    style={{
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: "#111827",
      fontSize: "10px",
    }}
  >
    ▼
  </span>
</div>

    <input
  type="tel"
  value={phone}
  onChange={(e) => {
    setPhone(e.target.value);
    setErrors((prev) => ({ ...prev, phone: undefined }));
  }}
  placeholder={phonePlaceholders[phoneCode] || "Unesite broj telefona"}
  className={fieldClass(!!errors.phone)}
/>
  </div>
  {errorText(errors.phone)}
  <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "6px" }}>
  Salon će vas kontaktirati na ovaj broj ako bude potrebno.
</p>
</div>

<div className="mb-3.5">
  <label className={labelClass}>Email</label>

  <input
  type="email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: undefined }));
  }}
  placeholder="Unesite email adresu"
 className={fieldClass(!!errors.email)}
/>
  {errorText(errors.email)}
  <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "6px" }}>
    Ako unesete email, dobit ćete potvrdu i link za otkazivanje.
  </p>
</div>

<div>
  <label className={labelClass}>Napomena</label>

<textarea
  value={napomena}
  onChange={(e) => setNapomena(e.target.value)}
  placeholder="Dodatne informacije..."
  rows={3}
  className="w-full rounded-xl border border-[#d1d5db] bg-white p-3.5 outline-none transition focus:border-[#611a1a] focus:ring-2 focus:ring-[#611a1a]/20"
/>
</div>
</div>

      </div>

{/* List längst ner med Nastavi (alltid synlig). */}
<div
  style={{
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    backgroundColor: "#ffffff",
    borderTop: "1px solid #ead1d1",
    boxShadow: "0 -6px 20px rgba(0, 0, 0, 0.08)",
    padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
  }}
>
  <div
    style={{
      maxWidth: "860px",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      gap: "14px",
    }}
  >
    <p style={{ margin: 0, flex: isMobile ? "none" : 1, fontSize: "14px", color: "#6b7280" }}>
      Korak 3 od 4
    </p>

 <button
  type="button"
  onClick={handleNext}
  className={geist.className}
  style={{
    flex: isMobile ? 1 : "none",
    width: isMobile ? undefined : "240px",
    height: "48px",
    backgroundColor: "#611a1a",
    color: "white",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "16px",
  }}
>
  Nastavi
</button>
  </div>
</div>
    </main>
  );
}