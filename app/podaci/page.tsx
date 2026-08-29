"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { parsePhoneNumberFromString } from "libphonenumber-js";

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
const [isMobile, setIsMobile] = useState(false);

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
const handleNext = () => {
  if (!ime.trim() || !prezime.trim() || !phone.trim()) {
    alert("Molimo unesite ime, prezime i broj telefona.");
    return;
  }

  const country = phoneCountries[phoneCode];

const parsedPhone = country
  ? parsePhoneNumberFromString(phone, country)
  : undefined;

if (!parsedPhone || !parsedPhone.isValid()) {
  alert("Molimo unesite ispravan broj telefona.");
  return;
}

const normalizedPhone = parsedPhone.number;

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
normalizedPhone,
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

  return (
    <main
  className={
    isMobile
      ? "min-h-screen bg-white px-4 py-4"
      : "min-h-screen bg-white px-8 py-6"
  }
>
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

   
  </div>

  <div
  className={
    isMobile
      ? "hidden"
      : "flex items-center gap-2"
  }
>
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
  className="mb-6"
  style={{
    width: "100%",
    maxWidth: "420px",
    padding: "18px 20px",
    borderRadius: "18px",
    backgroundColor: "rgba(97, 26, 26, 0.03)",
    border: "1px solid rgba(97, 26, 26, 0.15)",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)",
  }}
>
  <p
    style={{
      margin: 0,
      color: "#111827",
      fontSize: "24px",
      fontWeight: "700",
    }}
  >
    {service ? service.name : "Učitava se..."}
  </p>

  {service?.description && (
    <p
      style={{
  marginTop: "4px",
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.5",
}}
    >
      {service.description}
    </p>
  )}

  <div
    style={{
      display: "flex",
      gap: "40px",
      alignItems: "center",
      marginTop: "18px",
      marginBottom: "18px",
    }}
  >
    <div>
      <p
        style={{
          margin: 0,
          marginBottom: "3px",
          color: "#6b7280",
          fontSize: "13px",
        }}
      >
        Datum
      </p>

      <p
        style={{
          margin: 0,
          color: "#111827",
          fontSize: "17px",
          fontWeight: "700",
        }}
      >
        {date
          ? (() => {
              const [year, month, day] = date.split("-");
              return `${day}.${month}.${year}`;
            })()
          : ""}
      </p>
    </div>

    <div>
      <p
        style={{
          margin: 0,
          marginBottom: "3px",
          color: "#6b7280",
          fontSize: "13px",
        }}
      >
        Vrijeme
      </p>

      <p
        style={{
          margin: 0,
          color: "#111827",
          fontSize: "17px",
          fontWeight: "700",
        }}
      >
        {time}
      </p>
    </div>
  </div>

  <div
  style={{
    display: isMobile ? "grid" : "flex",
    gridTemplateColumns: isMobile ? "repeat(3, minmax(0, 1fr))" : undefined,
    gap: isMobile ? "12px" : "32px",
    alignItems: "start",
  }}
>
    {service?.show_price && (
      <div>
        <p
          style={{
            margin: 0,
            marginBottom: "3px",
            color: "#6b7280",
            fontSize: "13px",
          }}
        >
          Cijena
        </p>

        <p
          style={{
            margin: 0,
            color: "#111827",
            fontSize: "17px",
            fontWeight: "700",
          }}
        >
          {service.price} KM
        </p>
      </div>
    )}

    {service?.show_duration && (
      <div>
        <p
          style={{
            margin: 0,
            marginBottom: "3px",
            color: "#6b7280",
            fontSize: "13px",
          }}
        >
          Trajanje
        </p>

        <p
          style={{
            margin: 0,
            color: "#111827",
            fontSize: "17px",
            fontWeight: "700",
          }}
        >
          {service.duration_minutes || 60} min
        </p>
      </div>
    )}

    <div>
      <p
        style={{
          margin: 0,
          marginBottom: "3px",
          color: "#6b7280",
          fontSize: "13px",
        }}
      >
        Frizer
      </p>

      <p
        style={{
          margin: 0,
          color: "#111827",
          fontSize: "17px",
          fontWeight: "700",
        }}
      >
        {barberId
          ? barber
            ? barber.name
            : "Učitava se..."
          : "Bilo koji frizer"}
      </p>
    </div>
  </div>
</div>

{isMobile && (
  <div
    className="flex w-full items-center"
    style={{
      marginTop: "-10px",
      marginBottom: "12px",
      paddingLeft: "170px",
    }}
  >
    {[
      { nr: "1", active: true },
      { nr: "2", active: true },
      { nr: "3", active: true },
      { nr: "4", active: false },
    ].map((step, index) => (
      <div key={step.nr} className="flex items-center">
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: "700",
            backgroundColor: step.active ? "#611a1a" : "#ffffff",
            color: step.active ? "#ffffff" : "#6b7280",
            border: step.active
              ? "1px solid #611a1a"
              : "1px solid #d1d5db",
          }}
        >
          {step.nr}
        </div>

        {index < 3 && (
          <div
            style={{
              width: "24px",
              height: "1px",
              backgroundColor:
                index < 2 ? "#611a1a" : "#d1d5db",
            }}
          />
        )}
      </div>
    ))}
  </div>
)}


        <div
  className={
    isMobile
      ? "mx-auto max-w-4xl rounded-3xl border border-[#611a1a] bg-white p-4 shadow-sm"
      : "mx-auto max-w-4xl rounded-3xl border border-[#611a1a] bg-white p-6 shadow-sm"
  }
>
        <div
  className={
    isMobile
      ? "mb-6 grid grid-cols-1 gap-4"
      : "mb-6 grid grid-cols-2 gap-6"
  }
>

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
  className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-[#611a1a] focus:ring-2 focus:ring-[#611a1a]/20"
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

  <div
  className={
    isMobile
      ? "flex gap-2"
      : "flex gap-3"
  }
>
    <select
  value={phoneCode}
  onChange={(e) => setPhoneCode(e.target.value)}
  className={
  isMobile
    ? "w-28 rounded-xl border border-[#611a1a] px-3 py-3"
    : "w-40 rounded-xl border border-[#611a1a] px-4 py-3"
}
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

    <input
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder={phonePlaceholders[phoneCode] || "Unesite broj telefona"}
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
  placeholder={isMobile ? "Unesite email adresu" : "Unesite email adresu ako želite primiti potvrdu i putem emaila."}
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