"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

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
const [serviceSteps, setServiceSteps] = useState<any[]>([]);
const [bookedServiceSteps, setBookedServiceSteps] = useState<any[]>([]);
const [availableTimes, setAvailableTimes] = useState<any[]>([]);
const [barbers, setBarbers] = useState<any[]>([]);
const [salonId, setSalonId] = useState<number | null>(null);
const [weekOffset, setWeekOffset] = useState(0);





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

    const { data: salonData, error: salonError } = await supabase
      .from("salons")
      .select("id")
      .eq("slug", salonSlug)
      .single();

    if (salonError) {
      console.error(salonError);
      return;
    }

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

    const { data, error } = await supabase
      .from("available_times")
      .select("*")
      .eq("salon_id", salonData.id)
      .gte("date", weekStart)
      .lte("date", weekEnd)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setAvailableTimes(data || []);
  }

  fetchAvailableTimes();
}, [salonSlug, weekOffset]);
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
}, [salon]);

  const today = new Date();

const monday = new Date(today);
const day = monday.getDay();
const diff = day === 0 ? -6 : 1 - day;

monday.setDate(today.getDate() + diff + weekOffset * 7);

const weekDays = Array.from({ length: 7 }).map((_, index) => {
  const date = new Date(monday);
  date.setDate(monday.getDate() + index);

  const dayNames = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];

  return {
    day: dayNames[date.getDay()],
    label: String(date.getDate()),
    date: date.toISOString().split("T")[0],
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
return (
  <main className="min-h-screen bg-white px-8 py-6">
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
    <div className="mx-auto max-w-7xl">
      
      {service && (
  <div
  className="mb-8 inline-block rounded-xl border px-5 py-3"
  style={{
    backgroundColor: "rgba(97, 26, 26, 0.03)",
    border: "1px solid rgba(97, 26, 26, 0.15)",
  }}
>
    <p className="font-bold">{service.name}</p>

    <p className="text-gray-600">
      {service.price} KM • {service.duration_minutes || 60} min
    </p>
  </div>
)}

      <div className="mb-10 flex items-end justify-between gap-8">
  <div>
  <h1 className="text-2xl font-bold text-gray-950">
    Odaberi termin
  </h1>

  <div
  className="mt-3 flex items-center gap-6"
  style={{
    color: "#611a1a",
    marginLeft: "45px",
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
  const closedBarberIdsForDay = closedDays
  .filter(
    (day) =>
      day.date === item.date &&
      day.barber_id !== null
  )
  .map((day) => day.barber_id);
  const areAllBarbersClosed =
  !barberId &&
  barbers.length > 0 &&
  barbers.every((barber) =>
    closedBarberIdsForDay.includes(barber.id)
  );

  return (
          <div
            key={item.day}
            className="min-h-[360px] bg-white"
style={{
  borderRight: "1px solid rgba(97, 26, 26, 0.25)",
}}
          >
            <div
  className="p-4 text-center"
  style={{
    borderBottom: "1px solid rgba(97, 26, 26, 0.25)",
    backgroundColor: "rgba(97, 26, 26, 0.03)",
  }}
>
              <p className="text-lg font-semibold text-[#611a1a]">
                {item.day}
              </p>

              <p className="text-4xl font-bold text-[#611a1a]">
                {item.label}
              </p>
            </div>

            <div className="space-y-3 p-4">
  {isPastDay ||
  isClosedDay ||
  isSelectedBarberClosed ||
  areAllBarbersClosed ? (
    <p className="pt-10 text-center text-lg font-medium italic text-gray-400">
  {isClosedDay || isSelectedBarberClosed || areAllBarbersClosed
    ? "Zatvoreno"
    : "Dan je prošao"}
</p>
) : item.day === "Ned" ? (
  <p className="pt-10 text-center text-lg font-medium italic text-[#611a1a]">
    Nema termina
  </p>
) : (
                availableTimes.map((slot) => {
  const time = slot.time;

  if (slot.date !== item.date) return null;

  

const slotMinutes = timeToMinutes(slot.time);
const serviceDuration = service?.duration_minutes || 30;
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

const isBooked = barberId
  ? bookingsForSlot.length > 0
  : barbers.length > 0 &&
    barbers.every((barber) => busyBarberIds.includes(barber.id));
const hasEnoughSlots = Array.from({ length: slotsNeeded }).every((_, index) => {
  const nextTime = slotMinutes + index * 30;

  const exists = availableTimes.some((availableSlot) => {
    if (availableSlot.date !== item.date) return false;

    return timeToMinutes(availableSlot.time) === nextTime;
  });

  return exists;
});
  if (isBooked) return null;

if (slotsNeeded > 1 && !hasEnoughSlots) return null;

  return (
    <button
  key={time}
  type="button"
  onClick={() => {
    setSelectedDate(item.date);
    setSelectedTime(time);
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
  className="w-full rounded-xl py-2 font-bold"
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