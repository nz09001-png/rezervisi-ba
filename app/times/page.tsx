"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Source_Sans_3, Geist } from "next/font/google";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
});

const geist = Geist({
  subsets: ["latin"],
});

function TimesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const salon = searchParams.get("salon");
const salonSlug = searchParams.get("salonSlug");
const serviceId = searchParams.get("serviceId");
const barberId = searchParams.get("barberId");
  const [service, setService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
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
const [weekOffset, setWeekOffset] = useState(0);
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
  )}&barberId=${encodeURIComponent(barberId || "")}`
);
}


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
    ? `${startDate.label}–${endDate.label} ${startMonth}`
    : `${startDate.label} ${startMonth} – ${endDate.label} ${endMonth}`;
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
  >
    <Link
  href={`/${salonSlug}`}
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
    <div className="mx-auto w-full max-w-7xl">
      
  {service && (
    <div
      className="mb-8"
      style={{
  width: "100%",
  maxWidth: isMobile ? "100%" : "340px",
  padding: isMobile ? "14px 20px" : "18px 20px",
        borderRadius: "18px",
        backgroundColor: "rgba(97, 26, 26, 0.03)",
        border: "1px solid rgba(97, 26, 26, 0.15)",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)",
      }}
    >
      

      <p
        style={{
          margin: 0,
          marginBottom: isMobile ? "10px" : "18px",
          color: "#111827",
          fontSize: isMobile ? "20px" : "24px",
          fontWeight: "700",
        }}
      >
        {service.name}
      </p>
      {service.description && (
  <p
    style={{
      margin: 0,
      marginTop: "-18px",
      marginBottom: "10px",
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
    gap: isMobile ? "0" : "32px",
    alignItems: "center",
    justifyContent: isMobile ? "space-between" : "flex-start",
    width: isMobile ? "100%" : "auto",
  }}
>
        {service.show_price && (
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

        {service.show_duration && (
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
    Osoblje
  </p>

  <p
    style={{
      margin: 0,
      color: "#111827",
      fontSize: "17px",
      fontWeight: "700",
    }}
  >
    {selectedBarber ? selectedBarber.name : "Bez preferencije"}
  </p>
</div>
      </div>
    </div>
  )}
  
{isMobile && (
  <div
    className="flex w-full items-center justify-center"
    style={{
      marginTop: "-20px",
      marginBottom: "12px",
    }}
  >
      {[
        { nr: "1", active: true },
        { nr: "2", active: true },
        { nr: "3", active: false },
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
                  index === 0 ? "#611a1a" : "#d1d5db",
              }}
            />
          )}
        </div>
      ))}
    </div>
  )}

<div
  className={`flex items-end justify-between gap-8 ${
    isMobile ? "mb-10" : "mb-6"
  }`}
>
  <div
  style={{
    width: isMobile ? "100%" : "auto",
    display: isMobile ? "flex" : "block",
    alignItems: isMobile ? "center" : undefined,
    justifyContent: isMobile ? "space-between" : undefined,
    gap: isMobile ? "12px" : undefined,
  }}
>
    <h1
  className="font-bold"
  style={{
    fontSize: isMobile ? "19px" : "30px",
    whiteSpace: isMobile ? "nowrap" : undefined,
  }}
>
  Odaberite termin
</h1>

<div
  className={`${isMobile ? "mt-0" : "mt-3"} flex items-center`}
  style={{
  color: "#611a1a",
  marginLeft: isMobile ? "0" : "45px",
  marginRight: isMobile ? "12px" : "0",
  gap: isMobile ? "12px" : "24px",
  whiteSpace: "nowrap",
}}
>
  {weekOffset > 0 && (
    <button
      type="button"
      onClick={() => setWeekOffset((prev) => Math.max(0, prev - 1))}
      style={{ color: "#611a1a" }}
      className="text-2xl font-bold"
    >
      ←
    </button>
  )}

  <span className="text-lg font-bold">
    {weekTitle}
  </span>

  <button
    type="button"
    onClick={() => setWeekOffset((prev) => prev + 1)}
    style={{ color: "#611a1a" }}
    className="text-2xl font-bold"
  >
    →
  </button>
</div>


</div>

  <div className="hidden md:flex md:items-center md:gap-2">
    {[
      { nr: "1", label: "USLUGA", active: true },
      { nr: "2", label: "VRIJEME", active: true },
      { nr: "3", label: "PODACI", active: false },
      { nr: "4", label: "POTVRDA", active: false },
    ].map((step, index) => (
      <div key={step.nr} className="flex items-center gap-1 md:gap-4">
        <div className="flex flex-col items-center">
          <div
            style={{
              width: "22px",
              height: "22px",
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
            className={`mt-1 text-[10px] md:text-[11px] font-semibold tracking-wide ${
              step.active ? "text-[#611a1a]" : "text-gray-500"
            }`}
          >
            {step.label}
          </p>
        </div>

        {index < 3 && (
  <div
    style={{
      width: "24px",
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




<div style={{ position: "relative" }}>
<div
  ref={calendarRef}
  className="rounded-3xl"
  style={{
    display: "grid",
    marginTop: isMobile ? "-35px" : undefined,
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    border: "1px solid #611a1a",
    backgroundColor: "#ffffff",
    overflow: "hidden",

    ...(isMobile
  ? {
      width: "calc(100% + 20px)",
      marginLeft: "-10px",
      marginRight: "-10px",
    }
  : {}),
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

  return (
          <div
            key={item.day}
            className={
  isMobile
    ? "bg-white"
    : "min-h-[360px] bg-white"
}
style={{
  borderRight: "1px solid rgba(97, 26, 26, 0.25)",
}}
          >
            <div
  className={isMobile ? "px-2 py-3 text-center" : "p-4 text-center"}
  style={{
    borderBottom: "1px solid rgba(97, 26, 26, 0.25)",
    backgroundColor: "rgba(97, 26, 26, 0.03)",
  }}
>
              <p
  className={
    isMobile
      ? "text-sm font-semibold text-[#611a1a]"
      : "text-lg font-semibold text-[#611a1a]"
  }
>
  {item.day}
</p>

<p
  className={
    isMobile
      ? "text-2xl font-bold text-[#611a1a]"
      : "text-4xl font-bold text-[#611a1a]"
  }
>
  {item.label}
</p>
            </div>

            <div
  className={
    isMobile
  ? "space-y-1.5 px-1 py-3"
  : "space-y-3 p-4"
  }
>
  {isPastDay ||
isClosedDay ||
isClosedWeekday ||
isSelectedBarberClosed ||
areAllBarbersClosed ||
isSelectedBarberIneligible ? (
 <p
  className={
    isMobile
  ? "mt-3 text-center text-[9px] font-semibold text-gray-400 whitespace-nowrap"
  : "pt-10 text-center text-lg font-medium italic text-gray-400"
  }
>
    {isSelectedBarberIneligible
      ? "Osoblje nije dostupno za ovu uslugu"
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
className={
  isMobile
    ? "mx-auto w-[calc(100%_-_2px)] rounded-lg py-3 text-[14px] font-bold"
    : "w-full rounded-xl py-2 font-bold"
}
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


<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    marginTop: isMobile ? "12px" : "24px",
  }}
>
 <button
  type="button"
  disabled={!selectedTime}
  onClick={handleContinue}
  className={geist.className}
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
    <Suspense fallback={<div>Učitava se...</div>}>
      <TimesContent />
    </Suspense>
  );
}