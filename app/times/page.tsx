"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Source_Sans_3, Geist, Montserrat } from "next/font/google";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
});

const geist = Geist({
  subsets: ["latin"],
});

// Rubriker och salongens namn – samma som salongssidan.
const montserrat = Montserrat({
  weight: ["600", "700"],
  subsets: ["latin", "latin-ext"],
});

function TimesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const salon = searchParams.get("salon");
const salonSlug = searchParams.get("salonSlug");
const serviceId = searchParams.get("serviceId");
const barberId = searchParams.get("barberId");
  const [service, setService] = useState<any>(null);
  // När kunden kommer tillbaka från /podaci ("← Nazad") finns datum och tid i
  // adressen: sidan öppnas på rätt vecka med tiden förvald. Datum som har
  // passerat ignoreras (då som vanligt: den här veckan, ingen vald tid).
  const initialSelection = (() => {
    const urlDate = searchParams.get("date") || "";
    const urlTime = searchParams.get("time") || "";
    const empty = { date: "", time: "", weekOffset: 0 };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(urlDate) || !urlTime) return empty;

    const [y, m, d] = urlDate.split("-").map(Number);
    const picked = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (picked < today) return empty;

    const mondayOf = (date: Date) => {
      const monday = new Date(date);
      const day = monday.getDay();
      monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));
      return monday;
    };
    const weekOffset = Math.round(
      (mondayOf(picked).getTime() - mondayOf(today).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );
    return { date: urlDate, time: urlTime, weekOffset };
  })();
  const [selectedDate, setSelectedDate] = useState(initialSelection.date);
  const [selectedTime, setSelectedTime] = useState(initialSelection.time);
const [bookedTimes, setBookedTimes] = useState<any[]>([]);
const [closedDays, setClosedDays] = useState<any[]>([]);
const [closedWeekdays, setClosedWeekdays] = useState<string[]>([]);
const [shortenedHours, setShortenedHours] = useState<any[]>([]);
const [serviceSteps, setServiceSteps] = useState<any[]>([]);
const [bookedServiceSteps, setBookedServiceSteps] = useState<any[]>([]);
const [availableTimes, setAvailableTimes] = useState<any[]>([]);
const [barbers, setBarbers] = useState<any[]>([]);
const selectedBarber = barberId
  ? barbers.find((barber) => barber.id === Number(barberId))
  : null;
const [salonId, setSalonId] = useState<number | null>(null);
const [weekOffset, setWeekOffset] = useState(initialSelection.weekOffset);
const [eligibleBarberIds, setEligibleBarberIds] = useState<number[]>([]);
const [isMobile, setIsMobile] = useState(false);
// För rutan "Nema slobodnih termina ove sedmice". Reglerna för lediga tider
// ändras inte – sidan räknar bara hur många tidsknappar som syns i kalendern.
const calendarRef = useRef<HTMLDivElement>(null);
const [timesLoaded, setTimesLoaded] = useState(false);
const [barbersLoaded, setBarbersLoaded] = useState(false);
const [isWeekEmpty, setIsWeekEmpty] = useState(false);

useEffect(() => {
  const visibleSlots =
    calendarRef.current?.querySelectorAll("button").length ?? 0;

  setIsWeekEmpty(
    timesLoaded && barbersLoaded && !!service && visibleSlots === 0
  );
});

// Om den valda tiden ligger i veckan som visas men inte längre finns som
// ledig knapp (t.ex. någon annan hann boka den) tas valet bort.
// Vilken vecka de inlästa lediga tiderna gäller (så att kontrollen nedan inte
// körs med förra veckans tider medan en ny vecka laddas).
const loadedWeekOffsetRef = useRef<number | null>(null);
useEffect(() => {
  if (!selectedDate || !selectedTime) return;
  if (!timesLoaded || !barbersLoaded || !service) return;
  if (loadedWeekOffsetRef.current !== weekOffset) return;
  if (!weekDays.some((day) => day.date === selectedDate)) return;

  const slotButton = calendarRef.current?.querySelector(
    `button[data-slot="${selectedDate} ${selectedTime}"]`
  );
  if (!slotButton) {
    setSelectedDate("");
    setSelectedTime("");
  }
});





const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

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

const getBusyIntervalsForBooking = (booking: any) => {
  const bookingStart = timeToMinutes(booking.booking_time);

  const steps = bookedServiceSteps
    .filter((step) => step.service_id === booking.service_id)
    .sort((a, b) => a.step_order - b.step_order);

  if (steps.length === 0) {
    return [
      {
        start: bookingStart,
        end: bookingStart + (booking.duration_minutes || 30),
      },
    ];
  }

  let offset = 0;
  const busyIntervals = [];

  for (const step of steps) {
    const stepStart = bookingStart + offset;
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
  

  function handleContinue() {
  if (!selectedTime) return;

  router.push(
  `/podaci?salon=${encodeURIComponent(salon || "")}&salonSlug=${encodeURIComponent(
    salonSlug || ""
  )}&serviceId=${serviceId}&date=${encodeURIComponent(
    selectedDate
  )}&time=${encodeURIComponent(
    selectedTime
  )}&barberId=${encodeURIComponent(barberId || "")}${customerParams}`
);
}

// Kundens uppgifter (finns i adressen när kunden kommer från /potvrda via
// "Promijeni") skickas vidare till /podaci så att fälten inte blir tomma.
const customerParams = (() => {
  const params = new URLSearchParams();
  ["ime", "prezime", "phoneCode", "phone", "email", "napomena"].forEach((key) => {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  });
  const text = params.toString();
  return text ? `&${text}` : "";
})();


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
  async function fetchClosedDays() {
    if (!salonId) return;

    const { data, error } = await supabase
      .from("closed_days")
      .select("date, reason, barber_id")
      .eq("salon_id", salonId)
      .order("date", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setClosedDays(data || []);
  }

  fetchClosedDays();
}, [salonId]);


useEffect(() => {
  async function fetchServiceSteps() {
    if (!serviceId) return;

    const { data, error } = await supabase
      .from("service_steps")
      .select("id, service_id, name, duration_minutes, is_barber_busy, step_order")
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
  async function fetchBookedServiceSteps() {
    const serviceIds = Array.from(
      new Set(
        bookedTimes
          .map((booking) => booking.service_id)
          .filter((id) => id !== null)
      )
    );

    if (serviceIds.length === 0) {
      setBookedServiceSteps([]);
      return;
    }

    const { data, error } = await supabase
      .from("service_steps")
      .select("service_id, duration_minutes, is_barber_busy, step_order")
      .in("service_id", serviceIds)
      .order("step_order", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setBookedServiceSteps(data || []);
  }

  fetchBookedServiceSteps();
}, [bookedTimes]);

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
    setBarbersLoaded(true);
  }

  fetchBarbers();
}, [salonId]);

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
  async function fetchAvailableTimes() {
    if (!salonSlug) return;
    setTimesLoaded(false);

    const { data: salonData, error: salonError } = await supabase
  .from("salons")
  .select("id, closed_weekdays")
  .eq("slug", salonSlug)
  .single();

    if (salonError) {
      console.error(salonError);
      return;
    }
    setClosedWeekdays(salonData.closed_weekdays || []);

const { data: shortenedHoursData, error: shortenedHoursError } =
  await supabase
    .from("salon_shortened_hours")
    .select("*")
    .eq("salon_id", salonData.id);

if (shortenedHoursError) {
  console.error(
    "Greška pri učitavanju skraćenog radnog vremena:",
    shortenedHoursError
  );
  return;
}

setShortenedHours(shortenedHoursData || []);

const currentDate = new Date();

    const mondayDate = new Date(currentDate);
    const currentDay = mondayDate.getDay();
    const difference = currentDay === 0 ? -6 : 1 - currentDay;

    mondayDate.setDate(
      currentDate.getDate() + difference + weekOffset * 7
    );

    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(mondayDate.getDate() + 6);

    function formatDate(date: Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    const weekStart = formatDate(mondayDate);
    const weekEnd = formatDate(sundayDate);

let query = supabase
  .from("available_times")
  .select("*")
  .eq("salon_id", salonData.id)
  .gte("date", weekStart)
  .lte("date", weekEnd);

if (barberId) {
  query = query.eq("barber_id", Number(barberId));
}

const { data, error } = await query
  .order("date", { ascending: true })
  .order("time", { ascending: true });
  

    if (error) {
  console.error(error);
  return;
}

setAvailableTimes(data || []);
loadedWeekOffsetRef.current = weekOffset;
setTimesLoaded(true);
  }

  fetchAvailableTimes();
}, [salonSlug, weekOffset, barberId]);
useEffect(() => {
 async function fetchBookedTimes() {
  if (!salon) return;

  let query = supabase
    .from("bookings")
    .select("booking_date, booking_time, duration_minutes, barber_id, service_id")
    .eq("salon", salon);

  if (barberId) {
    query = query.eq("barber_id", Number(barberId));
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return;
  }

  setBookedTimes(data || []);
}

  fetchBookedTimes();
}, [salon, barberId]);

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

  const today = new Date();

const monday = new Date(today);
const day = monday.getDay();
const diff = day === 0 ? -6 : 1 - day;

monday.setDate(today.getDate() + diff + weekOffset * 7);

const weekDays = Array.from({ length: 7 }).map((_, index) => {
  const date = new Date(monday);

  date.setDate(monday.getDate() + index);

  const dayNames = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return {
    day: dayNames[date.getDay()],
    label: String(date.getDate()),
    date: `${year}-${month}-${day}`,
  };
});
const monthNames = [
  "jan",
  "feb",
  "mar",
  "apr",
  "maj",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "dec",
];

const startDate = weekDays[0];
const endDate = weekDays[6];

const startMonth = monthNames[new Date(startDate.date).getMonth()];
const endMonth = monthNames[new Date(endDate.date).getMonth()];

const weekTitle =
  startMonth === endMonth
    ? `${startDate.label}. – ${endDate.label}. ${startMonth}`
    : `${startDate.label}. ${startMonth} – ${endDate.label}. ${endMonth}`;

// Texten i listen längst ner, t.ex. "Sri, 07.10. u 09:30".
const selectedLabel = (() => {
  if (!selectedDate || !selectedTime) return "";
  const [y, m, d] = selectedDate.split("-").map(Number);
  const shortDays = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];
  const weekday = shortDays[new Date(y, m - 1, d).getDay()];
  return `${weekday}, ${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}. u ${selectedTime}`;
})();

const todayString = (() => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(
    n.getDate()
  ).padStart(2, "0")}`;
})();
    const todayOnly = new Date();
todayOnly.setHours(0, 0, 0, 0);

// Visas när veckan inte har en enda ledig tid.
const renderWeekEmptyBox = () => (
  <div
    style={{
      border: "1px solid rgba(97, 26, 26, 0.15)",
      backgroundColor: isMobile ? "#fcf9f9" : "#ffffff",
      boxShadow: isMobile ? undefined : "0 4px 14px rgba(0, 0, 0, 0.06)",
      borderRadius: "18px",
      padding: isMobile ? "18px" : "24px 32px",
      textAlign: "center",
    }}
  >
    <p
      style={{
        margin: 0,
        marginBottom: "4px",
        color: "#111827",
        fontWeight: 700,
        fontSize: isMobile ? "16px" : "18px",
      }}
    >
      Nema slobodnih termina ove sedmice
    </p>
    <p
      style={{
        margin: 0,
        marginBottom: "14px",
        color: "#6b7280",
        fontSize: isMobile ? "14px" : "15px",
      }}
    >
      Pogledajte sljedeću sedmicu.
    </p>
    <button
      type="button"
      onClick={() => setWeekOffset((prev) => prev + 1)}
      className={geist.className}
      style={{
        backgroundColor: "#611a1a",
        color: "#ffffff",
        padding: "10px 22px",
        borderRadius: "12px",
        fontWeight: 700,
      }}
    >
      Sljedeća sedmica →
    </button>
  </div>
);

return (
  <main
    className={`${sourceSans.className} min-h-screen bg-white px-3 py-6 md:px-8`}
    style={{ paddingBottom: "110px" }}
  >
    <div className="mx-auto w-full" style={{ maxWidth: "860px" }}>
    <Link
  href={`/${salonSlug}`}
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

  {/* Sammanfattning: salong, tjänst, pris, tid och personal. */}
  {service && (
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

      <p
        style={{
          margin: 0,
          marginTop: "2px",
          color: "#111827",
          fontSize: "20px",
          fontWeight: "700",
        }}
      >
        {service.name}
      </p>

      {service.description && (
  <p
    style={{
      margin: 0,
      marginTop: "2px",
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
    gap: "22px",
    alignItems: "center",
    marginTop: "8px",
  }}
>
        {service.show_price && (
  <div>
    <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>Cijena</p>
    <p style={{ margin: 0, color: "#111827", fontSize: "16px", fontWeight: "700" }}>
      {service.price} KM
    </p>
  </div>
)}

        {service.show_duration && (
  <div>
    <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>Trajanje</p>
    <p style={{ margin: 0, color: "#111827", fontSize: "16px", fontWeight: "700" }}>
      {service.duration_minutes || 60} min
    </p>
  </div>
)}
      <div>
  <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>Osoblje</p>
  <p style={{ margin: 0, color: "#111827", fontSize: "16px", fontWeight: "700" }}>
    {selectedBarber ? selectedBarber.name : "Bez preferencije"}
  </p>
</div>
      </div>
    </div>
  )}

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
    { nr: "3", label: "PODACI", active: false },
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

{/* Rubrik + byte av vecka. */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
  }}
>
  <h1
    className={montserrat.className}
    style={{
      margin: 0,
      fontSize: isMobile ? "20px" : "24px",
      fontWeight: 700,
      letterSpacing: "-0.3px",
      color: "#111827",
      whiteSpace: "nowrap",
    }}
  >
    Odaberite termin
  </h1>

  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#611a1a", whiteSpace: "nowrap" }}>
    <button
      type="button"
      disabled={weekOffset === 0}
      onClick={() => setWeekOffset((prev) => Math.max(0, prev - 1))}
      aria-label="Prethodna sedmica"
      style={{
        width: "34px",
        height: "34px",
        borderRadius: "9999px",
        border: "1px solid #ead1d1",
        backgroundColor: "#ffffff",
        color: "#611a1a",
        fontSize: "18px",
        lineHeight: 1,
        opacity: weekOffset === 0 ? 0.35 : 1,
        cursor: weekOffset === 0 ? "default" : "pointer",
      }}
    >
      ‹
    </button>

    <span style={{ fontWeight: 700, fontSize: isMobile ? "15px" : "16px" }}>{weekTitle}</span>

    <button
      type="button"
      onClick={() => setWeekOffset((prev) => prev + 1)}
      aria-label="Sljedeća sedmica"
      style={{
        width: "34px",
        height: "34px",
        borderRadius: "9999px",
        border: "1px solid #ead1d1",
        backgroundColor: "#ffffff",
        color: "#611a1a",
        fontSize: "18px",
        lineHeight: 1,
        cursor: "pointer",
      }}
    >
      ›
    </button>
  </div>
</div>

<div style={{ position: "relative" }}>
<div
  ref={calendarRef}
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    border: "1px solid #ead1d1",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  }}
>
        {weekDays.map((item) => {
  const itemDate = new Date(item.date);
  itemDate.setHours(0, 0, 0, 0);

  const isPastDay = itemDate < todayOnly;
  const closedDay = closedDays.find(
  (day) => day.date === item.date && day.barber_id === null
);

const isClosedDay = !!closedDay;
const isSelectedBarberClosed = barberId
  ? closedDays.some(
      (day) =>
        day.date === item.date &&
        day.barber_id === Number(barberId)
    )
  : false;

const isSelectedBarberIneligible =
  !!barberId &&
  eligibleBarberIds.length > 0 &&
  !eligibleBarberIds.includes(Number(barberId));

  const closedBarberIdsForDay = closedDays
  .filter(
    (day) =>
      day.date === item.date &&
      day.barber_id !== null
  )
  .map((day) => day.barber_id);
  const relevantBarbersForClosedCheck =
  eligibleBarberIds.length > 0
    ? barbers.filter((barber) =>
        eligibleBarberIds.includes(barber.id)
      )
    : barbers;

const isClosedWeekday = closedWeekdays.includes(item.day);

    const areAllBarbersClosed =
  !barberId &&
  relevantBarbersForClosedCheck.length > 0 &&
  relevantBarbersForClosedCheck.every((barber) =>
    closedBarberIdsForDay.includes(barber.id)
  );

  // Dagen kan inte bokas (passerad, stängd m.m.) – samma villkor som nedan.
  const isDayUnavailable =
    isPastDay ||
    isClosedDay ||
    isClosedWeekday ||
    isSelectedBarberClosed ||
    areAllBarbersClosed ||
    isSelectedBarberIneligible;

  return (
          <div
            key={item.day}
            className={isMobile ? "bg-white" : "min-h-[360px] bg-white"}
style={{
  borderLeft: item.day === weekDays[0].day ? "none" : "1px solid #f1e4e4",
}}
          >
            <div
  className="text-center"
  style={{
    // Samma höjd på alla dagar, även när "DANAS" visas.
    height: isMobile ? "64px" : "72px",
    paddingTop: isMobile ? "8px" : "10px",
    borderBottom: "1px solid #ead1d1",
    backgroundColor: "#ffffff",
  }}
>
              <p
  style={{
    margin: 0,
    fontSize: isMobile ? "11px" : "13px",
    color: isDayUnavailable ? "#c4c4c4" : "#6b7280",
  }}
>
  {item.day}
</p>

<p
  style={{
    margin: 0,
    fontSize: isMobile ? "17px" : "20px",
    fontWeight: 700,
    color: isDayUnavailable ? "#c4c4c4" : "#611a1a",
  }}
>
  {item.label}
</p>

{item.date === todayString && (
  <p
    style={{
      margin: 0,
      fontSize: "9px",
      fontWeight: 700,
      letterSpacing: "0.5px",
      color: "#611a1a",
    }}
  >
    DANAS
  </p>
)}
            </div>

            <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? "6px" : "8px",
    padding: isMobile ? "8px 3px" : "10px 6px",
  }}
>
  {isPastDay ||
isClosedDay ||
isClosedWeekday ||
isSelectedBarberClosed ||
areAllBarbersClosed ||
isSelectedBarberIneligible ? (
 <p
  style={{
    margin: 0,
    paddingTop: "6px",
    textAlign: "center",
    fontSize: isMobile ? "10px" : "12px",
    color: "#c4c4c4",
    // Texten får radbrytas även på mobil ("Dan je / prošao") så att inget klipps.
    whiteSpace: "normal",
  }}
>
    {isSelectedBarberIneligible
      ? "Osoblje nije dostupno za ovu uslugu"
      : isPastDay
      ? "Dan je prošao"
      : isClosedDay ||
        isClosedWeekday ||
        isSelectedBarberClosed ||
        areAllBarbersClosed
        ? "Zatvoreno"
        : "Dan je prošao"}
</p>
) : (
  availableTimes.map((slot) => {
  const time = slot.time;

  if (slot.date !== item.date) return null;
  const shortenedHoursForDay = shortenedHours.find(
  (shortenedHour) => shortenedHour.weekday === item.day
);

if (shortenedHoursForDay) {
  const slotMinutes = timeToMinutes(slot.time);
  const shortenedStartMinutes = timeToMinutes(
    shortenedHoursForDay.start_time
  );
  const shortenedEndMinutes = timeToMinutes(
    shortenedHoursForDay.end_time
  );

  if (
    slotMinutes < shortenedStartMinutes ||
    slotMinutes >= shortenedEndMinutes
  ) {
    return null;
  }
}

  if (!barberId) {
  const firstMatchingSlotIndex = availableTimes.findIndex(
    (availableSlot) =>
      availableSlot.date === slot.date &&
      availableSlot.time === slot.time
  );

  const currentSlotIndex = availableTimes.indexOf(slot);

  if (currentSlotIndex !== firstMatchingSlotIndex) {
    return null;
  }
}

const slotMinutes = timeToMinutes(slot.time);
const now = new Date();

const today = `${now.getFullYear()}-${String(
  now.getMonth() + 1
).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

const currentMinutes = now.getHours() * 60 + now.getMinutes();

if (item.date === today && slotMinutes <= currentMinutes) {
  return null;
}
const serviceDuration = service?.duration_minutes || 30;

if (shortenedHoursForDay) {
  const shortenedEndMinutes = timeToMinutes(
    shortenedHoursForDay.end_time
  );

  if (slotMinutes + serviceDuration > shortenedEndMinutes) {
    return null;
  }
}

const slotsNeeded = Math.ceil(serviceDuration / 30);
const currentBusyIntervals =
  getBusyIntervalsForCurrentService(slotMinutes);


const bookingsForSlot = bookedTimes.filter((booking) => {
  if (booking.booking_date !== item.date) return false;

  const busyIntervals = getBusyIntervalsForBooking(booking);

  return busyIntervals.some((bookingInterval) => {
  return currentBusyIntervals.some((currentInterval) => {
    return (
      currentInterval.start < bookingInterval.end &&
      currentInterval.end > bookingInterval.start
    );
  });
});
});

const busyBarberIds = bookingsForSlot
  .map((booking) => booking.barber_id)
  .filter((id) => id !== null);

const relevantBarbers =
  eligibleBarberIds.length > 0
    ? barbers.filter((barber) =>
        eligibleBarberIds.includes(barber.id)
      )
    : barbers;

const hasEligibleBarberAvailable = barberId
  ? true
  : relevantBarbers.some((barber) =>
      availableTimes.some(
        (availableSlot) =>
          availableSlot.date === item.date &&
          availableSlot.time === slot.time &&
          availableSlot.barber_id === barber.id
      )
    );

if (!hasEligibleBarberAvailable) return null;

const scheduledBarbersForSlot = relevantBarbers.filter((barber) =>
  Array.from({ length: slotsNeeded }).every((_, index) => {
    const nextTime = slotMinutes + index * 30;

    return availableTimes.some(
      (availableSlot) =>
        availableSlot.date === item.date &&
        availableSlot.barber_id === barber.id &&
        timeToMinutes(availableSlot.time) === nextTime
    );
  })
);

const isBooked = barberId
  ? bookingsForSlot.length > 0
  : scheduledBarbersForSlot.length > 0 &&
    scheduledBarbersForSlot.every((barber) =>
      busyBarberIds.includes(barber.id)
    );
const hasEnoughSlots = barberId
  ? Array.from({ length: slotsNeeded }).every((_, index) => {
      const nextTime = slotMinutes + index * 30;

      return availableTimes.some(
        (availableSlot) =>
          availableSlot.date === item.date &&
          timeToMinutes(availableSlot.time) === nextTime
      );
    })
  : relevantBarbers.some((barber) =>
      Array.from({ length: slotsNeeded }).every((_, index) => {
        const nextTime = slotMinutes + index * 30;

        return availableTimes.some(
          (availableSlot) =>
            availableSlot.date === item.date &&
            availableSlot.barber_id === barber.id &&
            timeToMinutes(availableSlot.time) === nextTime
        );
      })
    );
  if (isBooked) return null;

if (slotsNeeded > 1 && !hasEnoughSlots) return null;

  return (
    <button
  key={time}
  type="button"
  data-slot={`${item.date} ${time}`}
  onClick={() => {
  if (selectedTime === time && selectedDate === item.date) {
    setSelectedDate("");
    setSelectedTime("");
  } else {
    setSelectedDate(item.date);
    setSelectedTime(time);
  }
}}
  style={{
    backgroundColor:
      selectedTime === time && selectedDate === item.date
        ? "#611a1a"
        : "#ffffff",
    color:
      selectedTime === time && selectedDate === item.date
        ? "#ffffff"
        : "#611a1a",
    border: "1px solid #611a1a",
    cursor: "pointer",
    transition: "all 0.2s ease",
    height: isMobile ? "36px" : "40px",
    borderRadius: isMobile ? "8px" : "10px",
    fontSize: isMobile ? "12px" : "14px",
  }}
  onMouseEnter={(e) => {
    if (!(selectedTime === time && selectedDate === item.date)) {
      e.currentTarget.style.backgroundColor = "#611a1a";
      e.currentTarget.style.color = "#ffffff";
    }
  }}
  onMouseLeave={(e) => {
    if (!(selectedTime === time && selectedDate === item.date)) {
      e.currentTarget.style.backgroundColor = "#ffffff";
      e.currentTarget.style.color = "#611a1a";
    }
  }}
className="w-full font-bold"

>
  {isBooked ? "Zauzeto" : time}
</button>
  );
})
              )}
            </div>
          </div>
          );
})}
</div>

{/* Desktop: rutan mitt i den tomma kalendern (under dagarnas rubriker). */}
{!isMobile && isWeekEmpty && (
  <div
    style={{
      position: "absolute",
      top: "110px",
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
    }}
  >
    <div style={{ pointerEvents: "auto" }}>{renderWeekEmptyBox()}</div>
  </div>
)}
</div>

{/* Mobil: rutan direkt under kalendern. */}
{isMobile && isWeekEmpty && (
  <div style={{ marginTop: "16px" }}>{renderWeekEmptyBox()}</div>
)}


{/* List längst ner: vald tid + Nastavi (alltid synlig). */}
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
    <div style={{ flex: isMobile ? "none" : 1, fontSize: "14px", color: "#6b7280", lineHeight: 1.3 }}>
      {selectedLabel ? (
        <>
          Odabrano
          <br />
          <b style={{ color: "#111827", fontSize: "16px" }}>{selectedLabel}</b>
        </>
      ) : (
        "Odaberite termin"
      )}
    </div>

 <button
  type="button"
  disabled={!selectedTime}
  onClick={handleContinue}
  className={geist.className}
  style={{
    flex: isMobile ? 1 : "none",
    width: isMobile ? undefined : "240px",
    height: "48px",
    backgroundColor: selectedTime ? "#611a1a" : "#e5e7eb",
    color: selectedTime ? "#ffffff" : "#9ca3af",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "16px",
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

export default function TimesPage() {
  return (
    <Suspense fallback={<div>Učitava se...</div>}>
      <TimesContent />
    </Suspense>
  );
}