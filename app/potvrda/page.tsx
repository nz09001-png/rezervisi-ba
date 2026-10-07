"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { CustomerData, readCustomerData } from "@/lib/customerData";
import { Source_Sans_3, Geist, Montserrat } from "next/font/google";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
});

const geist = Geist({
  subsets: ["latin"],
});

// Rubriker och salongens namn – samma som tidssidan och Podaci.
const montserrat = Montserrat({
  weight: ["600", "700"],
  subsets: ["latin", "latin-ext"],
});

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function PotvrdaPage() {
  const searchParams = useSearchParams();
const router = useRouter();

  const salon = searchParams.get("salon");
  const salonSlug = searchParams.get("salonSlug");
  const serviceId = searchParams.get("serviceId");
const date = searchParams.get("date");
const formattedDate = date
  ? `${date.split("-")[2]}.${date.split("-")[1]}.${date.split("-")[0]}`
  : "";
const time = searchParams.get("time");
const barberId = searchParams.get("barberId");
  // Kundens uppgifter kommer från flikens minne (sparade av /podaci), inte
  // från adressen. Saknas de skickas kunden tillbaka till /podaci.
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const ime = customer?.ime || "";
  const prezime = customer?.prezime || "";
  const phoneCode = customer?.phoneCode || "";
  const phone = customer?.phone || "";
  const normalizedPhone = customer?.normalizedPhone || "";
  const email = customer?.email || "";
  const napomena = customer?.napomena || "";

  useEffect(() => {
    const saved = readCustomerData();

    if (!saved.ime || !saved.phone) {
      router.replace(
        `/podaci?${new URLSearchParams({
          salon: salon || "",
          salonSlug: salonSlug || "",
          serviceId: serviceId || "",
          date: date || "",
          time: time || "",
          barberId: barberId || "",
        }).toString()}`
      );
      return;
    }

    setCustomer(saved);
    // Körs en gång när sidan öppnas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [service, setService] = useState<any>(null);
  const [barberName, setBarberName] = useState<string | null>(null);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [availableTimes, setAvailableTimes] = useState<any[]>([]);
  const [salonId, setSalonId] = useState<number | null>(null);
  const [closedDays, setClosedDays] = useState<any[]>([]);
const [loading, setLoading] = useState(false);
const [confirmed, setConfirmed] = useState(false);
const [timeTaken, setTimeTaken] = useState(false);
// Fel som visas i en vinröd ruta i kortet (i stället för grå alert-rutor).
// canRetry = tekniskt fel, kunden kan trycka "Završi rezervaciju" igen.
const [errorBox, setErrorBox] = useState<{
  title: string;
  text: string;
  canRetry: boolean;
} | null>(null);
const showTimeError = (title: string) =>
  setErrorBox({ title, text: "Molimo odaberite drugi termin.", canRetry: false });
const showTechnicalError = () =>
  setErrorBox({
    title: "Došlo je do greške",
    text: "Rezervacija nije spremljena. Molimo pokušajte ponovo.",
    canRetry: true,
  });
const [serviceSteps, setServiceSteps] = useState<any[]>([]);
const [eligibleBarberIds, setEligibleBarberIds] = useState<number[]>([]);
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

const getBusyIntervalsForCurrentService = (startMinutes: number) => {
  if (serviceSteps.length === 0) {
    const duration = service?.duration_minutes || 30;

    return [
      {
        start: startMinutes,
        end: startMinutes + duration,
      },
    ];
  }

  let offset = 0;
  const busyIntervals = [];

  for (const step of serviceSteps) {
    const stepStart = startMinutes + offset;
    const stepEnd = stepStart + step.duration_minutes;

    if (step.is_barber_busy) {
      busyIntervals.push({
        start: stepStart,
        end: stepEnd,
      });
    }

    offset += step.duration_minutes;
  }

  return busyIntervals;
};

useEffect(() => {
  async function fetchAvailableTimes() {
    if (!salonId || !date) return;

const { data, error } = await supabase
  .from("available_times")
  .select("time, barber_id")
  .eq("salon_id", salonId)
  .eq("date", date)
  .order("time", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setAvailableTimes(data || []);
  }

  fetchAvailableTimes();
}, [salonId, date]);

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
  async function fetchServiceSteps() {
    if (!serviceId) return;

    const { data, error } = await supabase
      .from("service_steps")
      .select("service_id, duration_minutes, is_barber_busy, step_order")
      .eq("service_id", serviceId)
      .order("step_order", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setServiceSteps(data || []);
  }

  fetchServiceSteps();
}, [serviceId]);

useEffect(() => {
  async function fetchEligibleBarbers() {
    if (!serviceId) {
      setEligibleBarberIds([]);
      return;
    }

    const { data, error } = await supabase
      .from("service_barbers")
      .select("barber_id")
      .eq("service_id", serviceId);

    if (error) {
      console.error(error);
      return;
    }

    setEligibleBarberIds(
      (data || []).map((item) => item.barber_id)
    );
  }

  fetchEligibleBarbers();
}, [serviceId]);

useEffect(() => {
  async function fetchBarber() {
    if (!barberId) {
      setBarberName(null);
      return;
    }

    const { data, error } = await supabase
      .from("barbers")
      .select("name")
      .eq("id", barberId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setBarberName(data.name);
  }

  fetchBarber();
}, [barberId]);

useEffect(() => {
  async function fetchSalonId() {
    if (!salonSlug) return;

    const { data, error } = await supabase
      .from("salons")
      .select("id")
      .eq("slug", salonSlug)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setSalonId(data.id);
  }

  fetchSalonId();
}, [salonSlug]);

useEffect(() => {
  async function fetchBarbers() {
    if (!salonId) return;

    const { data, error } = await supabase
      .from("barbers")
      .select("id, name")
      .eq("salon_id", salonId)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setBarbers(data || []);
  }

  fetchBarbers();
}, [salonId]);

useEffect(() => {
  async function fetchClosedDays() {
    if (!salonId) return;

    const { data, error } = await supabase
      .from("closed_days")
      .select("date, reason, barber_id")
      .eq("salon_id", salonId);

    if (error) {
      console.error(error);
      return;
    }

    setClosedDays(data || []);
  }

  fetchClosedDays();
}, [salonId]);

async function handleConfirmBooking() {
  if (confirmed) return;
  setErrorBox(null);
  if (date && time) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  const bookingDateTime = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes
  );

  if (bookingDateTime <= new Date()) {
    showTimeError("Odabrani termin je već prošao");
    return;
  }
}
  const isSelectedBarberIneligible =
  !!barberId &&
  eligibleBarberIds.length > 0 &&
  !eligibleBarberIds.includes(Number(barberId));

if (isSelectedBarberIneligible) {
  showTimeError("Odabrani član osoblja ne pruža ovu uslugu");
  return;
}

  const isSalonClosed = closedDays.some(
  (day) => day.date === date && day.barber_id === null
);

const isSelectedBarberClosed = barberId
  ? closedDays.some(
      (day) =>
        day.date === date &&
        day.barber_id === Number(barberId)
    )
  : false;

  const closedBarberIdsForDay = closedDays
  .filter(
    (day) =>
      day.date === date &&
      day.barber_id !== null
  )
  .map((day) => day.barber_id);

  const areAllBarbersClosed =
  !barberId &&
  barbers.length > 0 &&
  barbers.every((barber) =>
    closedBarberIdsForDay.includes(barber.id)
  );

if (
  isSalonClosed ||
  isSelectedBarberClosed ||
  areAllBarbersClosed
) {
  showTimeError("Salon ili član osoblja nije dostupan ovaj dan");
  return;
}

setTimeTaken(false);
setLoading(true);

 
  const cancelToken =
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
        .toString(36)
        .slice(2)}`;
  const requestedStart = timeToMinutes(time || "00:00");
const serviceDuration = service?.duration_minutes || 30;
const slotsNeeded = Math.ceil(serviceDuration / 30);
const barbersWithEnoughAvailableSlots = barbers.filter((barber) =>
  Array.from({ length: slotsNeeded }).every((_, index) => {
    const nextTime = requestedStart + index * 30;

    return availableTimes.some(
      (availableSlot) =>
        availableSlot.barber_id === barber.id &&
        timeToMinutes(availableSlot.time) === nextTime
    );
  })
);

const hasEnoughAvailableSlots = barberId
  ? barbersWithEnoughAvailableSlots.some(
      (barber) => barber.id === Number(barberId)
    )
  : barbersWithEnoughAvailableSlots.length > 0;

if (!hasEnoughAvailableSlots) {
  showTimeError("Termin nije dostupan za cijelo trajanje usluge");
  setLoading(false);
  return;
}

const currentBusyIntervals =
  getBusyIntervalsForCurrentService(requestedStart);
  // Säker databasfunktion: bara upptagna tider, inga kunduppgifter.
  const { data: bookedSlotsData, error: bookingsAtTimeError } = await supabase.rpc(
    "get_booked_slots",
    { p_salon: salon, p_date: date }
  );
  const bookingsAtTime = bookedSlotsData as
    | {
        barber_id: number | null;
        booking_time: string;
        duration_minutes: number | null;
        service_id: number | null;
      }[]
    | null;


if (bookingsAtTimeError) {
  console.error(bookingsAtTimeError);
  showTechnicalError();
  setLoading(false);
  return;
}
const bookedServiceIds = Array.from(
  new Set(
    (bookingsAtTime || [])
      .map((booking) => booking.service_id)
      .filter((id) => id !== null)
  )
);

let stepsForBookedServices: any[] = [];

if (bookedServiceIds.length > 0) {
  const { data: stepsData, error: stepsError } = await supabase
    .from("service_steps")
    .select("service_id, duration_minutes, is_barber_busy, step_order")
    .in("service_id", bookedServiceIds)
    .order("step_order", { ascending: true });

  if (stepsError) {
    console.error(stepsError);
    showTechnicalError();
    setLoading(false);
    return;
  }

  stepsForBookedServices = stepsData || [];
}
const overlappingBookings = (bookingsAtTime || []).filter((booking) => {
  const bookingStart = timeToMinutes(booking.booking_time);

  const steps = stepsForBookedServices
    .filter((step) => step.service_id === booking.service_id)
    .sort((a, b) => a.step_order - b.step_order);

  // Vanlig tjänst eller gammal bokning utan service_steps
  if (steps.length === 0) {
  const bookingDuration = booking.duration_minutes || 30;
  const bookingEnd = bookingStart + bookingDuration;

  return currentBusyIntervals.some((currentInterval) => {
    return (
      currentInterval.start < bookingEnd &&
      currentInterval.end > bookingStart
    );
  });
}

  let offset = 0;

  for (const step of steps) {
    const stepStart = bookingStart + offset;
    const stepEnd = stepStart + step.duration_minutes;

    if (step.is_barber_busy) {
  const hasOverlap = currentBusyIntervals.some((currentInterval) => {
    return (
      currentInterval.start < stepEnd &&
      currentInterval.end > stepStart
    );
  });

  if (hasOverlap) {
    return true;
  }
}

    offset += step.duration_minutes;
  }

  return false;
});

const busyBarberIds = overlappingBookings
  .map((booking) => booking.barber_id)
  .filter((id) => id !== null);
 
  const relevantBarbers =
  eligibleBarberIds.length > 0
    ? barbers.filter((barber) =>
        eligibleBarberIds.includes(barber.id)
      )
    : barbers;

const availableBarber = !barberId
  ? relevantBarbers.find(
      (barber) =>
        barbersWithEnoughAvailableSlots.some(
          (availableBarber) => availableBarber.id === barber.id
        ) &&
        !busyBarberIds.includes(barber.id) &&
        !closedBarberIdsForDay.includes(barber.id)
    )
  : null;

  const finalBarberId = barberId
  ? Number(barberId)
  : availableBarber?.id || null;

const finalBarberName = barberId
  ? barberName
  : availableBarber?.name || null;

  if (!finalBarberId) {
  setTimeTaken(true);
  setLoading(false);
  return;
}

const hasOverlapForFinalBarber = overlappingBookings.some(
  (booking) => booking.barber_id === finalBarberId
);

if (hasOverlapForFinalBarber) {
  setTimeTaken(true);
  setLoading(false);
  return;
}
  // Bokningen skapas av en säker databasfunktion som kontrollerar att salong,
  // tjänst och personal hör ihop. Svaret är { id } som förut.
  const { data, error } = await supabase.rpc("create_booking", {
    p_booking: {
  customer_name: `${ime} ${prezime}`,
  phone: normalizedPhone || `${phoneCode} ${phone}`,
  salon,
  booking_time: time,
  booking_date: date,
  service: service?.name,
  service_id: serviceId ? Number(serviceId) : null,
  duration_minutes: service?.duration_minutes || 60,
  barber_name: finalBarberName,
barber_id: finalBarberId,
email: email || null,
note: napomena || null,
cancel_token: cancelToken,
},
  });
  if (error) {
  console.error(error);
  showTechnicalError();
  setLoading(false);
  return;
}

const { error: notificationError } = await supabase
  .from("admin_notifications")
  .insert({
    salon_id: salonId,
    type: "booking_created",
    title: "Nova rezervacija",
    // Rad 1: kundens namn. Rad 2: datum, tid och personal (admin visar raderna snyggt).
    message: `${ime} ${prezime}\n${formattedDate} u ${time} · ${finalBarberName || "Bez preferencije"}`,
    event_date: date,
    event_time: time,
    is_read: false,
  });

if (notificationError) {
  console.error("Greška pri kreiranju notifikacije:", notificationError);
}

if (email && email.trim()) {
  const emailResponse = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      salon,
      service: service?.name,
      date,
      time,
      durationMinutes: service?.duration_minutes || 60,
      bookingId: data.id,
      cancelToken,
      // Extra uppgifter som bara visas i mejlet (samma som på "Rezervacija potvrđena").
      customerFirstName: ime || "",
      staff: barberId ? finalBarberName || "" : "Bez preferencije",
      price: service?.show_price && service?.price ? String(service.price) : "",
      showDuration: !!service?.show_duration,
    }),
  });

  await emailResponse.json();

}
setConfirmed(true);

router.replace(
  `/uspjesno?salon=${encodeURIComponent(salon || "")}&salonSlug=${encodeURIComponent(
    salonSlug || ""
  )}&service=${encodeURIComponent(service?.name || "")}&barber=${encodeURIComponent(
    barberId ? finalBarberName || "" : "Bez preferencije"
  )}&price=${encodeURIComponent(
    service?.price?.toString() || ""
  )}&duration=${encodeURIComponent(
    (service?.duration_minutes || 60).toString()
  )}&showPrice=${service?.show_price ? "true" : "false"}&showDuration=${
    service?.show_duration ? "true" : "false"
  }&date=${encodeURIComponent(
    date || ""
  )}&time=${encodeURIComponent(time || "")}`
);
}

  // Bara för visningen (notisen använder formattedDate som förut).
  const displayDate = date
    ? (() => {
        const [y, m, d] = date.split("-").map(Number);
        const shortDays = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];
        const weekday = shortDays[new Date(y, m - 1, d).getDay()];
        return `${weekday}, ${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
      })()
    : "";

  // Tid som "09:30 – 10:00" (slut = start + tjänstens längd).
  // Om salongen döljer längden visas bara starttiden (som på /uspjesno och i mejlet).
  const displayTime = (() => {
    if (!time) return "";
    if (!service || !service.show_duration) return time;
    const end = timeToMinutes(time) + (service.duration_minutes || 60);
    return `${time} – ${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
  })();

  const podaciHref = `/podaci?salon=${encodeURIComponent(
    salon || ""
  )}&salonSlug=${encodeURIComponent(
    salonSlug || ""
  )}&serviceId=${serviceId}&date=${date}&time=${time}${
    barberId ? `&barberId=${barberId}` : ""
  }`;
  // Kundens uppgifter följer inte med i adressen – /podaci läser flikens minne.

  const timesHref = `/times?salon=${encodeURIComponent(
    salon || ""
  )}&salonSlug=${encodeURIComponent(
    salonSlug || ""
  )}&serviceId=${serviceId}&barberId=${encodeURIComponent(barberId || "")}&${new URLSearchParams({
    // Vald tid (förvald på tidssidan). Kundens uppgifter ligger i flikens
    // minne, så fälten på /podaci blir inte tomma efter en ny tid.
    date: date || "",
    time: time || "",
  }).toString()}`;

  const cardStyle = {
    border: "1px solid #ead1d1",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    padding: "16px",
  };

  const capsStyle = {
    margin: 0,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color: "#9ca3af",
  };

  const editLink = {
    color: "#611a1a",
    fontWeight: 600,
    fontSize: "14px",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  };

  const row = (label: string, value: React.ReactNode, muted = false, first = false) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        padding: "10px 0",
        borderTop: first ? "none" : "1px solid #f1e4e4",
        fontSize: "16px",
      }}
    >
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span
        style={{
          fontWeight: muted ? 400 : 600,
          color: muted ? "#9ca3af" : "#111827",
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );

  const showConfirmButton = !timeTaken && (!errorBox || errorBox.canRetry);

  return (
  <main
    className={`${sourceSans.className} min-h-screen bg-white px-3 py-6 md:px-8`}
    style={{ paddingBottom: "110px" }}
  >
  <div className="mx-auto w-full" style={{ maxWidth: "860px" }}>
      <Link
  href={podaciHref}
  style={{
    color: "#611a1a",
    textDecoration: "none",
    fontWeight: "700",
    display: "inline-block",
    marginBottom: "4px",
  }}
>
  ← Nazad
</Link>

{/* Stegen med namn – alla fyra klara. */}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "6px",
    margin: "10px 0 14px",
  }}
>
  {["USLUGA", "VRIJEME", "PODACI", "POTVRDA"].map((label, index) => (
    <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
      {index > 0 && (
        <div style={{ width: "16px", height: "2px", marginTop: "10px", backgroundColor: "#611a1a" }} />
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
            backgroundColor: "#611a1a",
            color: "#ffffff",
          }}
        >
          {index + 1}
        </div>
        <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", color: "#611a1a" }}>
          {label}
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
  Provjerite rezervaciju
</h1>

<div
  style={{
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: "14px",
    alignItems: "start",
  }}
>
  {/* Kort 1: termin */}
  <div style={cardStyle}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <p className={montserrat.className} style={capsStyle}>Termin</p>
      <Link href={timesHref} style={editLink}>Promijeni</Link>
    </div>

    {salon && (
      <p
        className={montserrat.className}
        style={{
          margin: "4px 0 0",
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

    <p style={{ margin: "2px 0 6px", fontSize: "20px", fontWeight: 700, color: "#111827" }}>
      {service ? service.name : "Učitava se..."}
    </p>

    {row("Datum", displayDate, false, true)}
    {row("Vrijeme", displayTime)}
    {row("Osoblje", barberId ? barberName : "Bez preferencije")}
    {service?.show_price && row("Cijena", `${service.price} KM`)}
  </div>

  {/* Kort 2: kundens uppgifter */}
  <div style={cardStyle}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <p className={montserrat.className} style={capsStyle}>Vaši podaci</p>
      <Link href={podaciHref} style={editLink}>Promijeni</Link>
    </div>

    <div style={{ marginTop: "4px" }}>
      {row("Ime i prezime", `${ime || ""} ${prezime || ""}`.trim(), false, true)}
      {row(
        "Telefon",
        // Visar det rättade numret ("+387 61 000 000"), annars som kunden skrev det.
        parsePhoneNumberFromString(normalizedPhone || "")?.formatInternational() ||
          `${phoneCode || ""} ${phone || ""}`.trim()
      )}
      {email?.trim() && row("Email", email)}
      {row("Napomena", napomena || "Nema napomene", !napomena)}
    </div>
  </div>
</div>

{timeTaken && (
  <div
    className="mx-auto mt-6 max-w-md rounded-2xl p-5 text-center"
    style={{
      border: "2px solid #611a1a",
      backgroundColor: "#fff7f7",
    }}
  >
    <p
      className="mb-2 text-lg font-bold"
      style={{ color: "#611a1a" }}
    >
      ⚠ Termin je upravo rezervisan
    </p>

    <p className="mb-5 text-sm text-gray-700">
      Molimo odaberite drugi termin.
    </p>

    <button
      type="button"
      onClick={() => {
  window.history.go(-2);
}}
      style={{
        backgroundColor: "#611a1a",
        color: "white",
        padding: "10px 32px",
        borderRadius: "12px",
        fontWeight: "bold",
      }}
    >
      Nazad
    </button>
  </div>
)}
{!timeTaken && errorBox && (
  <div
    className="mx-auto mt-6 max-w-md rounded-2xl p-5 text-center"
    style={{
      border: "2px solid #611a1a",
      backgroundColor: "#fff7f7",
    }}
  >
    <p
      className="mb-2 text-lg font-bold"
      style={{ color: "#611a1a" }}
    >
      ⚠ {errorBox.title}
    </p>

    <p
      className={`text-sm text-gray-700 ${errorBox.canRetry ? "" : "mb-5"}`}
    >
      {errorBox.text}
    </p>

    {!errorBox.canRetry && (
      <Link
        href={timesHref}
        style={{
          display: "inline-block",
          backgroundColor: "#611a1a",
          color: "white",
          padding: "10px 24px",
          borderRadius: "12px",
          fontWeight: "bold",
          textDecoration: "none",
        }}
      >
        Odaberite drugi termin
      </Link>
    )}
  </div>
)}
</div>

{/* List längst ner: Završi rezervaciju (döljs när tiden inte längre går att boka). */}
{showConfirmButton && (
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
    <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", justifyContent: "flex-end" }}>
    <button
      type="button"
      onClick={handleConfirmBooking}
      disabled={loading || confirmed}
      className={geist.className}
      style={{
  width: isMobile ? "100%" : "280px",
  height: "48px",
  backgroundColor: "#611a1a",
  color: "white",
  borderRadius: "12px",
  fontWeight: "700",
  fontSize: "16px",
  opacity: loading || confirmed ? 0.7 : 1,
}}
    >
      {confirmed
  ? "Rezervacija potvrđena"
  : loading
  ? "Rezerviše se..."
  : "Završi rezervaciju"}
    </button>
    </div>
  </div>
)}
    </main>
  );
}