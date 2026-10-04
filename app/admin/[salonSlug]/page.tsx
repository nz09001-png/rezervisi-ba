"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Cropper from "react-easy-crop";
import DatePicker, {
  CalendarContainer,
  registerLocale,
} from "react-datepicker";
import { format } from "date-fns";
import { bs } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("bs", bs);

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}

async function getCroppedImage(
  imageSrc: string,
  croppedAreaPixels: any
): Promise<Blob> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas nije podržan");
  }

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Greška pri obradi slike"));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      0.95
    );
  });
}

async function createCroppedPreview(
  imageSrc: string,
  croppedAreaPixels: any
): Promise<string> {
  const blob = await getCroppedImage(imageSrc, croppedAreaPixels);

  return URL.createObjectURL(blob);
}

export default function AdminPage() {
    const params = useParams();
const salonSlug = params.salonSlug as string;
const [salon, setSalon] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [calendarServiceSteps, setCalendarServiceSteps] = useState<any[]>([]);
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
const [galleryFile, setGalleryFile] = useState<File | null>(null);
const [galleryPreviewUrl, setGalleryPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
const [phone, setPhone] = useState("");
const [address, setAddress] = useState("");
const [openingHours, setOpeningHours] = useState("");
const [openingHoursFrom, setOpeningHoursFrom] = useState("");
const [openingHoursTo, setOpeningHoursTo] = useState("");
const [closedWeekdays, setClosedWeekdays] = useState<string[]>([]);
const [shortenedHours, setShortenedHours] = useState<any[]>([]);
const [shortenedFrom, setShortenedFrom] = useState("");
const [shortenedTo, setShortenedTo] = useState("");
const [selectedShortenedWeekdays, setSelectedShortenedWeekdays] = useState<string[]>([]);
const [instagramUrl, setInstagramUrl] = useState("");
const [facebookUrl, setFacebookUrl] = useState("");
const [tiktokUrl, setTiktokUrl] = useState("");
const [showBarbers, setShowBarbers] = useState(false);
const [heroPosition, setHeroPosition] = useState("center");
const [services, setServices] = useState<any[]>([]);
const [serviceCategories, setServiceCategories] = useState<any[]>([]);
const [newServiceCategoryName, setNewServiceCategoryName] = useState("");
const [serviceName, setServiceName] = useState("");
const [selectedServiceCategoryId, setSelectedServiceCategoryId] = useState<number | "">("");
const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
const [serviceDescription, setServiceDescription] = useState("");
const serviceFormRef = useRef<HTMLDivElement | null>(null);
const notificationsRef = useRef<HTMLDivElement>(null);
const mobileCalendarScrollRef = useRef<HTMLDivElement | null>(null);
const mobileCalendarScrollModeRef = useRef<
  "today" | "monday" | "keep"
>("today");
const mobileCalendarSavedScrollLeftRef = useRef(0);
const [servicePrice, setServicePrice] = useState("");
const [serviceDuration, setServiceDuration] = useState("");
const [showPrice, setShowPrice] = useState(true);
const [showDuration, setShowDuration] = useState(true);
const [hasServiceSteps, setHasServiceSteps] = useState(false);
const [serviceSteps, setServiceSteps] = useState([
  {
    name: "",
    duration_minutes: "",
    is_barber_busy: true,
  },
]);
const totalDuration = serviceSteps.reduce((total, step) => {
  return total + (Number(step.duration_minutes) || 0);
}, 0);
const [times, setTimes] = useState<any[]>([]);
const [calendarAvailableTimes, setCalendarAvailableTimes] = useState<any[]>([]);
const [selectedDate, setSelectedDate] = useState("");
const datePickerRef = useRef<DatePicker>(null);
const scheduleStartDatePickerRef = useRef<DatePicker>(null);
const scheduleEndDatePickerRef = useRef<DatePicker>(null);
const closedDatePickerRef = useRef<DatePicker>(null);
const closedEndDatePickerRef = useRef<DatePicker>(null);
const [generatedTimes, setGeneratedTimes] = useState<any[]>([]);
const [showPreview, setShowPreview] = useState(false);
const [timesSaved, setTimesSaved] = useState(false);
const [newTime, setNewTime] = useState("09:00");
const [manualTimeBarberId, setManualTimeBarberId] = useState<number | "all">("all");
const [startTime, setStartTime] = useState("09:00");
const [endTime, setEndTime] = useState("17:00");
const [intervalMinutes, setIntervalMinutes] = useState("30");
const [selectedDays, setSelectedDays] = useState([
  "Pon",
  "Uto",
  "Sri",
  "Čet",
  "Pet",
]);
const [scheduleStartDate, setScheduleStartDate] = useState("");
const [scheduleEndDate, setScheduleEndDate] = useState("");
const [selectedScheduleBarberIds, setSelectedScheduleBarberIds] = useState<number[]>([]);
const [notifications, setNotifications] = useState<any[]>([]);
const [barbers, setBarbers] = useState<any[]>([]);
const [newBarberName, setNewBarberName] = useState("");
const [closedDays, setClosedDays] = useState<any[]>([]);
const [closedDate, setClosedDate] = useState("");
const [closedReason, setClosedReason] = useState("");
const [closedEndDate, setClosedEndDate] = useState("");
const [closedBarberId, setClosedBarberId] = useState<number | null>(null);
const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
const [confirmCancelBooking, setConfirmCancelBooking] = useState(false);
const [isCancellingBooking, setIsCancellingBooking] = useState(false);
const [bookingCancelError, setBookingCancelError] = useState<string | null>(null);

// Ny bokning öppnas eller rutan stängs: börja om utan fråga eller fel.
useEffect(() => {
  setConfirmCancelBooking(false);
  setBookingCancelError(null);
}, [selectedBooking]);

// Esc stänger bokningsrutan (desktop).
useEffect(() => {
  if (!selectedBooking) return;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") setSelectedBooking(null);
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [selectedBooking]);
const [calendarBarberFilter, setCalendarBarberFilter] = useState<number | "all">("all");
const isSingleBarberFiltered = calendarBarberFilter !== "all";
const [showBarberFilterMenu, setShowBarberFilterMenu] = useState(false);
const [showPreviousBookings, setShowPreviousBookings] = useState(false);
const [calendarWeekStart, setCalendarWeekStart] = useState(() => {
  const today = new Date();
  const monday = new Date(today);
  const currentDay = today.getDay();

  const diffToMonday =
    currentDay === 0 ? -6 : 1 - currentDay;

  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  return monday;
});
const [showNotifications, setShowNotifications] = useState(false);
const [showSettingsMenu, setShowSettingsMenu] = useState(false);
const [selectedSettings, setSelectedSettings] = useState<string[]>([]);
const [showServiceForm, setShowServiceForm] = useState(false);
const [timesTab, setTimesTab] = useState<"week" | "day">("week");
const [showShortenedForm, setShowShortenedForm] = useState(false);
// Meddelanderutan överst (ersätter webbläsarens grå alert-rutor).
const [notice, setNotice] = useState<{
  text: string;
  type: "success" | "error";
} | null>(null);

useEffect(() => {
  if (!notice) return;

  const timer = setTimeout(
    () => setNotice(null),
    notice.type === "success" ? 3000 : 6000
  );

  return () => clearTimeout(timer);
}, [notice]);

function showNotice(text: string, type: "success" | "error" = "error") {
  setNotice({ text, type });
}
const [isUploadingImage, setIsUploadingImage] = useState(false);
const [selectedServiceBarberIds, setSelectedServiceBarberIds] = useState<number[]>([]);
const [showFilterMenu, setShowFilterMenu] = useState(false);
const [showDateFilter, setShowDateFilter] = useState(false);
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  if (!isMobile || !selectedBooking) return;

  const previousOverflow = document.body.style.overflow;

  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = previousOverflow;
  };
}, [isMobile, selectedBooking]);


function handleCancelServiceEdit() {
  setShowServiceForm(false);
  setEditingServiceId(null);
  setSelectedServiceBarberIds([]);
  setServiceName("");
  setSelectedServiceCategoryId("");
  setServiceDescription("");
  setServicePrice("");
  setServiceDuration("60");
  setShowPrice(true);
  setShowDuration(true);
  setHasServiceSteps(false);

  setServiceSteps([
    {
      name: "",
      duration_minutes: "",
      is_barber_busy: true,
    },
  ]);
}

async function handleEditService(service: any) {
  setEditingServiceId(service.id);
  setServiceName(service.name || "");
  setSelectedServiceCategoryId(service.category_id ?? "");
  setServiceDescription(service.description || "");
  setServicePrice(
    service.price !== null && service.price !== undefined
      ? String(service.price)
      : ""
  );
  setServiceDuration(
    service.duration_minutes !== null &&
      service.duration_minutes !== undefined
      ? String(service.duration_minutes)
      : "60"
  );
  setShowPrice(service.show_price ?? true);
  setShowDuration(service.show_duration ?? true);

  const { data: serviceBarbersData, error: serviceBarbersError } =
  await supabase
    .from("service_barbers")
    .select("barber_id")
    .eq("service_id", service.id);

if (serviceBarbersError) {
  console.error(
    "Kunde inte hämta frisörer för tjänsten:",
    serviceBarbersError
  );
  return;
}

setSelectedServiceBarberIds(
  (serviceBarbersData || []).map((item) => item.barber_id)
);

  const { data: stepsData, error: stepsError } = await supabase
    .from("service_steps")
    .select("name, duration_minutes, is_barber_busy, step_order")
    .eq("service_id", service.id)
    .order("step_order", { ascending: true });

  if (stepsError) {
    console.error("Kunde inte hämta tjänstens steg:", stepsError);
    return;
  }

  if (stepsData && stepsData.length > 0) {
    setHasServiceSteps(true);

    setServiceSteps(
      stepsData.map((step) => ({
        name: step.name || "",
        duration_minutes:
          step.duration_minutes !== null &&
          step.duration_minutes !== undefined
            ? String(step.duration_minutes)
            : "",
        is_barber_busy: step.is_barber_busy ?? true,
      }))
    );
  }  else {
    setHasServiceSteps(false);

    setServiceSteps([
      {
        name: "",
        duration_minutes: "",
        is_barber_busy: true,
      },
    ]);
  }
  serviceFormRef.current?.scrollIntoView({
  behavior: "smooth",
  block: "start",
});
}



  function handleLogin() {
  

  if (password.trim() === salon?.admin_password) {
    setIsLoggedIn(true);
  } else {
    alert("Pogrešna lozinka");
  }
}

// Bosnisk böjning: 1 usluga, 2–4 usluge, 5+ usluga (21 usluga, 22 usluge …).
function uslugaLabel(count: number) {
  const lastDigit = count % 10;
  const lastTwo = count % 100;

  if (lastDigit === 1 && lastTwo !== 11) return `${count} usluga`;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return `${count} usluge`;
  }

  return `${count} usluga`;
}

// Postavke-sidan: ett avsnitt i taget. Tom lista = rutorna visas.
function openSetting(setting: string) {
  setSelectedSettings([setting]);
  document.getElementById("postavke-stranica")?.scrollTo(0, 0);
}

function backToSettings() {
  setSelectedSettings([]);
  document.getElementById("postavke-stranica")?.scrollTo(0, 0);
}

function openSettingsPage() {
  setSelectedSettings([]);
  setShowSettingsMenu(true);
}

function closeSettingsPage() {
  setShowSettingsMenu(false);
  setSelectedSettings([]);
}

  async function fetchBookings() {
    const { data, error } = await supabase
  .from("bookings")
  .select("*")
  .eq("salon", salon?.salon_name)
  .order("created_at", { ascending: false });

    if (error) {
      setError(true);
      return;
    }

    setBookings(data || []);
  }

async function fetchCalendarServiceSteps() {
  const serviceIds = [
    ...new Set(
      bookings
        .map((booking) => booking.service_id)
        .filter((id) => id != null)
    ),
  ];

  if (serviceIds.length === 0) {
    setCalendarServiceSteps([]);
    return;
  }

  const { data, error } = await supabase
    .from("service_steps")
    .select("service_id, duration_minutes, is_barber_busy, step_order")
    .in("service_id", serviceIds)
    .order("step_order", { ascending: true });

  if (error) {
    console.error("Greška pri učitavanju koraka tretmana:", error);
    return;
  }

  setCalendarServiceSteps(data || []);
}

 async function fetchSalonInfo() {
  const { data, error } = await supabase
    .from("salons")
    .select(
  "description, phone, address, opening_hours, closed_weekdays, hero_position, instagram_url, facebook_url, tiktok_url"
)
    .eq("id", salon?.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  setDescription(data.description || "");
  setPhone(data.phone || "");
  setAddress(data.address || "");
  const savedOpeningHours = data.opening_hours || "";

setOpeningHours(savedOpeningHours);

const [fromTime = "", toTime = ""] = savedOpeningHours.split("-");

setOpeningHoursFrom(fromTime.trim());
setOpeningHoursTo(toTime.trim());
setClosedWeekdays(data.closed_weekdays || []);

setHeroPosition(data.hero_position || "center");

  setInstagramUrl(data.instagram_url || "");
  setFacebookUrl(data.facebook_url || "");
  setTiktokUrl(data.tiktok_url || "");
}

async function fetchShortenedHours() {
  if (!salon?.id) return;

  const { data, error } = await supabase
    .from("salon_shortened_hours")
    .select("*")
    .eq("salon_id", salon.id)
    .order("weekday", { ascending: true });

  if (error) {
    console.error("Greška pri učitavanju skraćenog radnog vremena:", error);
    return;
  }

  setShortenedHours(data || []);
}

async function fetchServices() {
  const { data, error } = await supabase
    .from("services")
    .select(`
      *,
      service_barbers (
        barber_id
      )
    `)
    .eq("salon_id", salon?.id)
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  setServices(data || []);
}

async function fetchServiceCategories() {
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("salon_id", salon?.id)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  setServiceCategories(data || []);
}

// Utan namn används texten i fältet; med namn kommer det från en förslagsknapp.
async function handleAddServiceCategory(suggestedName?: string) {
  const categoryName = (suggestedName ?? newServiceCategoryName).trim();

  if (!categoryName || !salon?.id) return;

  const nextSortOrder =
    serviceCategories.length > 0
      ? Math.max(...serviceCategories.map((category) => category.sort_order || 0)) + 1
      : 1;

  const { error } = await supabase
    .from("service_categories")
    .insert({
      salon_id: salon.id,
      name: categoryName,
      sort_order: nextSortOrder,
    });

  if (error) {
    console.error(error);
    showNotice("Greška pri dodavanju kategorije.");
    return;
  }

  if (!suggestedName) setNewServiceCategoryName("");
  fetchServiceCategories();
  showNotice("Kategorija je dodana.", "success");
}

async function handleDeleteServiceCategory(id: number) {
  const { data: linkedServices, error: servicesError } = await supabase
    .from("services")
    .select("id")
    .eq("category_id", id)
    .limit(1);

  if (servicesError) {
    console.error(servicesError);
    return;
  }

  if (linkedServices && linkedServices.length > 0) {
    showNotice("Kategorija se ne može obrisati jer sadrži usluge.");
    return;
  }

  const confirmDelete = confirm("Da li ste sigurni da želite obrisati kategoriju?");

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("service_categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    showNotice("Greška pri brisanju kategorije.");
    return;
  }

  fetchServiceCategories();
  showNotice("Kategorija je obrisana.", "success");
}

async function fetchTimes(date?: string) {
  let query = supabase
    .from("available_times")
    .select("*")
    .eq("salon_id", salon?.id);

  if (date) {
    query = query.eq("date", date);
  }

  if (manualTimeBarberId !== "all") {
    query = query.eq("barber_id", manualTimeBarberId);
  }

  const { data, error } = await query.order("time", {
    ascending: true,
  });

  if (error) {
    console.error(error);
    return;
  }

  setTimes(data || []);
}

async function fetchCalendarAvailableTimes() {
  if (!salon?.id) return;

  const weekStart = new Date(calendarWeekStart);
  const weekEnd = new Date(calendarWeekStart);
  weekEnd.setDate(calendarWeekStart.getDate() + 6);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const { data, error } = await supabase
    .from("available_times")
    .select("*")
    .eq("salon_id", salon.id)
    .gte("date", formatDate(weekStart))
    .lte("date", formatDate(weekEnd))
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  setCalendarAvailableTimes(data || []);
  
}


  
async function fetchBarbers() {
  if (!salon?.id) return;

  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("salon_id", salon.id)
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  setBarbers(data || []);
}
const barberColors = [
  {
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
    textColor: "#1e3a8a",
  },
  {
    backgroundColor: "#fef3c7",
    borderColor: "#fcd34d",
    textColor: "#78350f",
  },
  {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
    textColor: "#14532d",
  },
  {
    backgroundColor: "#f3e8ff",
    borderColor: "#d8b4fe",
    textColor: "#581c87",
  },
  {
    backgroundColor: "#ffedd5",
    borderColor: "#fdba74",
    textColor: "#7c2d12",
  },
  {
    backgroundColor: "#cffafe",
    borderColor: "#67e8f9",
    textColor: "#164e63",
  },
  {
    backgroundColor: "#fce7f3",
    borderColor: "#f9a8d4",
    textColor: "#831843",
  },
  {
    backgroundColor: "#e0e7ff",
    borderColor: "#a5b4fc",
    textColor: "#312e81",
  },
  {
    backgroundColor: "#ecfccb",
    borderColor: "#bef264",
    textColor: "#365314",
  },
  {
    backgroundColor: "#fee2e2",
    borderColor: "#fca5a5",
    textColor: "#7f1d1d",
  },
];

function getBarberColor(barberId: number | null) {
  if (!barberId) {
    return {
      backgroundColor: "#f7eeee",
      borderColor: "#ead1d1",
      textColor: "#611a1a",
    };
  }

  const barber = barbers.find(
    (barber) => Number(barber.id) === Number(barberId)
  );

  if (
    barber?.color_index !== null &&
    barber?.color_index !== undefined
  ) {
    return barberColors[
      Number(barber.color_index) % barberColors.length
    ];
  }

  return barberColors[
    Math.abs(Number(barberId)) % barberColors.length
  ];
}
async function fetchClosedDays() {
  if (!salon?.id) return;

  const { data, error } = await supabase
    .from("closed_days")
    .select("*")
    .eq("salon_id", salon.id)
    .order("date", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  setClosedDays(data || []);
}
async function fetchGalleryImages() {
  if (!salon?.id) return;

  const { data, error } = await supabase
    .from("salon_images")
    .select("*")
    .eq("salon_id", salon.id)
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  setGalleryImages(data || []);
}
async function fetchNotifications() {
  if (!salon?.id) return;

  const { data, error } = await supabase
    .from("admin_notifications")
    .select("*")
    .eq("salon_id", salon.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const now = new Date();

const visibleNotifications = (data || []).filter((notification) => {
  if (!notification.event_date || !notification.event_time) {
    return true;
  }

  const eventDateTime = new Date(
    `${notification.event_date}T${notification.event_time}`
  );

  const hideAfter = new Date(
    eventDateTime.getTime() + 24 * 60 * 60 * 1000
  );

  return now < hideAfter;
});

setNotifications(visibleNotifications);
}

async function markNotificationAsRead(id: number) {
  const { error } = await supabase
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) {
    console.error(error);
    showNotice("Nije moguće označiti obavijest kao pročitanu.");
    return;
  }

  fetchNotifications();
}

// "Označi sve kao pročitano": alla olästa notiser för salongen på en gång.
async function markAllNotificationsAsRead() {
  if (!salon?.id) return;

  const { error } = await supabase
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("salon_id", salon.id)
    .eq("is_read", false);

  if (error) {
    console.error(error);
    showNotice("Nije moguće označiti obavijesti kao pročitane.");
    return;
  }

  fetchNotifications();
}

// När notisen kom: "upravo", "prije 5 min", "prije 2 h" eller "03.10. u 14:32".
function formatNotificationTime(createdAt?: string) {
  if (!createdAt) return "";

  const created = new Date(createdAt);
  const minutes = Math.floor((Date.now() - created.getTime()) / 60000);

  if (minutes < 1) return "upravo";
  if (minutes < 60) return `prije ${minutes} min`;
  if (minutes < 24 * 60) return `prije ${Math.floor(minutes / 60)} h`;

  const day = String(created.getDate()).padStart(2, "0");
  const month = String(created.getMonth() + 1).padStart(2, "0");
  const hours = String(created.getHours()).padStart(2, "0");
  const mins = String(created.getMinutes()).padStart(2, "0");
  return `${day}.${month}. u ${hours}:${mins}`;
}

// Nya notiser har två rader (namn \n datum · personal): namnet visas fetstilt.
// Gamla notiser är en hel mening och visas som förut.
function renderNotificationMessage(message?: string) {
  const [firstLine, ...rest] = String(message || "").split("\n");

  if (rest.length === 0) return firstLine;

  return (
    <>
      <span style={{ display: "block", fontWeight: 600, color: "#111827" }}>
        {firstLine}
      </span>
      <span style={{ display: "block" }}>{rest.join(" ")}</span>
    </>
  );
}

async function handleAddTime() {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(newTime)) {
  showNotice("Unesite vrijeme u formatu HH:MM, npr. 15:30.");
  return;
}

  if (!salon?.id || !selectedDate) return;

  if (manualTimeBarberId === "all") {
    const existingBarberIds = times
      .filter((item) => item.time === newTime)
      .map((item) => item.barber_id);

    const barbersToAdd = barbers.filter(
      (barber) => !existingBarberIds.includes(barber.id)
    );

    if (barbersToAdd.length === 0) {
      showNotice("Ovo vrijeme već postoji.");
      return;
    }

    const { error } = await supabase
      .from("available_times")
      .insert(
        barbersToAdd.map((barber) => ({
          salon_id: salon.id,
          barber_id: barber.id,
          date: selectedDate,
          time: newTime,
        }))
      );

    if (error) {
      showNotice("Greška pri dodavanju vremena.");
      console.error(error);
      return;
    }
  } else {
    if (times.some((item) => item.time === newTime)) {
      showNotice("Ovo vrijeme već postoji.");
      return;
    }

    const { error } = await supabase
      .from("available_times")
      .insert({
        salon_id: salon.id,
        barber_id: manualTimeBarberId,
        date: selectedDate,
        time: newTime,
      });

    if (error) {
      showNotice("Greška pri dodavanju vremena.");
      console.error(error);
      return;
    }
  }

  setNewTime("09:00");
  fetchTimes(selectedDate);
  showNotice("Termin je dodan.", "success");
}
async function handleDeleteTime(id: number) {
  const confirmDelete = confirm(
    "Da li ste sigurni da želite obrisati vrijeme?"
  );

  if (!confirmDelete) return;

  if (manualTimeBarberId === "all") {
    const selectedTime = times.find((item) => item.id === id)?.time;

    if (!selectedTime) return;

    const { error } = await supabase
      .from("available_times")
      .delete()
      .eq("salon_id", salon?.id)
      .eq("date", selectedDate)
      .eq("time", selectedTime);

    if (error) {
      showNotice("Greška pri brisanju vremena.");
      console.error(error);
      return;
    }
  } else {
    const { error } = await supabase
      .from("available_times")
      .delete()
      .eq("id", id)
      .eq("barber_id", manualTimeBarberId);

    if (error) {
      showNotice("Greška pri brisanju vremena.");
      console.error(error);
      return;
    }
  }

  fetchTimes(selectedDate);
  showNotice("Termin je obrisan.", "success");
}
async function handleDeleteAllTimesForDate() {
  const confirmDelete = confirm(
    manualTimeBarberId === "all"
      ? "Da li ste sigurni da želite obrisati sve termine za ovaj datum za cijeli salon?"
      : "Da li ste sigurni da želite obrisati sve termine za ovaj datum za odabranog člana osoblja?"
  );

  if (!confirmDelete) return;

  let query = supabase
    .from("available_times")
    .delete()
    .eq("salon_id", salon?.id)
    .eq("date", selectedDate);

  if (manualTimeBarberId !== "all") {
    query = query.eq("barber_id", manualTimeBarberId);
  }

  const { error } = await query;

  if (error) {
    showNotice("Greška pri brisanju termina.");
    console.error(error);
    return;
  }

  fetchTimes(selectedDate);
  showNotice("Termini za ovaj dan su obrisani.", "success");
}





async function handleAddBarber() {
  if (!newBarberName.trim()) {
    showNotice("Unesite ime člana osoblja.");
    return;
  }

  const usedColorIndexes = barbers
    .map((barber) => barber.color_index)
    .filter(
      (colorIndex) =>
        colorIndex !== null && colorIndex !== undefined
    );

  const availableColorIndex = barberColors.findIndex(
    (_, index) => !usedColorIndexes.includes(index)
  );

  if (availableColorIndex === -1) {
    showNotice("Nema više dostupnih boja za novog člana osoblja.");
    return;
  }

  const { error } = await supabase
    .from("barbers")
    .insert({
      salon_id: salon?.id,
      name: newBarberName.trim(),
      is_active: true,
      color_index: availableColorIndex,
    });

  if (error) {
    showNotice("Greška pri dodavanju člana osoblja.");
    console.error(error);
    return;
  }

  setNewBarberName("");
  fetchBarbers();
  showNotice("Član osoblja je dodan.", "success");
}

async function handleDeleteBarber(id: number) {
  const confirmDelete = confirm("Da li ste sigurni da želite obrisati člana osoblja?");

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("barbers")
    .delete()
    .eq("id", id);

  if (error) {
    showNotice("Greška pri brisanju člana osoblja.");
    console.error(error);
    return;
  }

  fetchBarbers();
  showNotice("Član osoblja je obrisan.", "success");
}

async function handleAddClosedDay() {
  if (!closedDate || !closedEndDate) {
    showNotice("Odaberite početni i završni datum.");
    return;
  }

  if (new Date(closedEndDate) < new Date(closedDate)) {
    showNotice("Završni datum ne može biti prije početnog datuma.");
    return;
  }

  const dates = [];

  const currentDate = new Date(closedDate);
  const endDate = new Date(closedEndDate);

  while (currentDate <= endDate) {
    dates.push({
      salon_id: salon?.id,
      date: currentDate.toISOString().split("T")[0],
      reason: closedReason,
      barber_id: closedBarberId,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const duplicate = dates.find((newDay) =>
    closedDays.some(
      (existingDay) =>
        existingDay.date === newDay.date &&
        (existingDay.barber_id ?? null) === (newDay.barber_id ?? null)
    )
  );

  if (duplicate) {
    showNotice("Ovaj zatvoreni dan već postoji.");
    return;
  }

  const { error } = await supabase
    .from("closed_days")
    .insert(dates);

  if (error) {
    showNotice("Greška pri dodavanju zatvorenih dana.");
    console.error(error);
    return;
  }

  setClosedDate("");
  setClosedEndDate("");
  setClosedReason("");
  setClosedBarberId(null);

  fetchClosedDays();
  showNotice("Zatvoreni dani su sačuvani.", "success");
}
async function handleDeleteClosedDay(id: number) {
  const confirmDelete = confirm("Da li ste sigurni da želite obrisati zatvoreni dan?");

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("closed_days")
    .delete()
    .eq("id", id);

  if (error) {
    showNotice("Greška pri brisanju zatvorenog dana.");
    console.error(error);
    return;
  }

  fetchClosedDays();
  showNotice("Zatvoreni dan je obrisan.", "success");
}

// Tar bort en hel period (flera dagar i rad) med en enda fråga.
async function handleDeleteClosedDayGroup(ids: number[]) {
  const confirmDelete = confirm(
    ids.length === 1
      ? "Da li ste sigurni da želite obrisati zatvoreni dan?"
      : `Da li ste sigurni da želite obrisati ovih ${ids.length} zatvorenih dana?`
  );

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("closed_days")
    .delete()
    .in("id", ids);

  if (error) {
    showNotice("Greška pri brisanju zatvorenog dana.");
    console.error(error);
    return;
  }

  fetchClosedDays();
  showNotice(
    ids.length === 1 ? "Zatvoreni dan je obrisan." : "Zatvoreni dani su obrisani.",
    "success"
  );
}

async function handleAddService() {
  if (!selectedServiceCategoryId) {
    showNotice("Izaberite kategoriju.");
    return;
  }

  if (!serviceName.trim()) {
    showNotice("Unesite naziv usluge.");
    return;
  }

  if (editingServiceId !== null) {
    console.log("editingServiceId =", editingServiceId);
  const { data: updatedServices, error: updateError } = await supabase
  .from("services")
  .update({
    name: serviceName.trim(),
    description: serviceDescription.trim() || null,
    price: servicePrice.trim() || null,
    duration_minutes: hasServiceSteps
      ? totalDuration
      : serviceDuration.trim()
        ? Number(serviceDuration)
        : null,
    show_price: showPrice,
show_duration: showDuration,
category_id: selectedServiceCategoryId || null,
  })
  .eq("id", editingServiceId)
  .select();

console.log("UPPDATERADE RADER:", updatedServices);

  if (updateError) {
  console.log(updateError);
  console.error(updateError);
  showNotice("Greška pri spremanju usluge. Pokušajte ponovo.");
  return;
}

console.log("UPDATE OK");
console.log({
  serviceName,
  servicePrice,
  serviceDescription,
  showPrice,
  showDuration,
});

const { error: deleteStepsError } = await supabase
  .from("service_steps")
  .delete()
  .eq("service_id", editingServiceId);

if (deleteStepsError) {
  console.error(deleteStepsError);
  showNotice("Greška pri spremanju usluge. Pokušajte ponovo.");
  return;
}

if (hasServiceSteps) {
  const stepsToInsert = serviceSteps.map((step, index) => ({
    service_id: editingServiceId,
    name: step.name.trim(),
    duration_minutes: Number(step.duration_minutes),
    is_barber_busy: step.is_barber_busy,
    step_order: index + 1,
  }));

  const { error: insertStepsError } = await supabase
    .from("service_steps")
    .insert(stepsToInsert);

  if (insertStepsError) {
    console.error(insertStepsError);
  showNotice("Greška pri spremanju usluge. Pokušajte ponovo.");
    return;
  }
}

const { error: deleteServiceBarbersError } = await supabase
  .from("service_barbers")
  .delete()
  .eq("service_id", editingServiceId);

if (deleteServiceBarbersError) {
  console.error(deleteServiceBarbersError);
  showNotice("Greška pri spremanju usluge. Pokušajte ponovo.");
  return;
}

if (selectedServiceBarberIds.length > 0) {
  const serviceBarbersToInsert = selectedServiceBarberIds.map(
    (barberId) => ({
      service_id: editingServiceId,
      barber_id: barberId,
    })
  );

  const { error: insertServiceBarbersError } = await supabase
    .from("service_barbers")
    .insert(serviceBarbersToInsert);

  if (insertServiceBarbersError) {
    console.error(insertServiceBarbersError);
  showNotice("Greška pri spremanju usluge. Pokušajte ponovo.");
    return;
  }
}

await fetchServices();
handleCancelServiceEdit();

showNotice("Usluga je uspješno ažurirana.", "success");
return;
}

  const { data, error } = await supabase
  .from("services")
  .insert({
  salon_id: salon?.id,
  name: serviceName.trim(),
  description: serviceDescription.trim() || null,
  price: servicePrice.trim() || null,
  duration_minutes: hasServiceSteps
  ? totalDuration
  : serviceDuration.trim()
    ? Number(serviceDuration)
    : null,

  show_price: showPrice,
show_duration: showDuration,
category_id: selectedServiceCategoryId || null,
})
.select()
.single();

  if (error) {
  console.error(error);
  showNotice("Greška pri spremanju usluge. Pokušajte ponovo.");
  return;
}

if (hasServiceSteps) {
  const stepsToInsert = serviceSteps.map((step, index) => ({
    service_id: data.id,
    name: step.name,
    duration_minutes: Number(step.duration_minutes),
    is_barber_busy: step.is_barber_busy,
    step_order: index + 1,
  }));

  const { error: stepError } = await supabase
    .from("service_steps")
    .insert(stepsToInsert);

  if (stepError) {
    console.error(stepError);
  showNotice("Greška pri spremanju usluge. Pokušajte ponovo.");
    return;
  }
}

if (selectedServiceBarberIds.length > 0) {
  const serviceBarbersToInsert = selectedServiceBarberIds.map(
    (barberId) => ({
      service_id: data.id,
      barber_id: barberId,
    })
  );

  const { error: serviceBarbersError } = await supabase
    .from("service_barbers")
    .insert(serviceBarbersToInsert);

  if (serviceBarbersError) {
    console.error(serviceBarbersError);
  showNotice("Greška pri spremanju usluge. Pokušajte ponovo.");
    return;
  }
}



  setServiceName("");
setSelectedServiceCategoryId("");
setServiceDescription("");
setServicePrice("");
setServiceDuration("60");
setShowPrice(true);
setShowDuration(true);

setHasServiceSteps(false);

setServiceSteps([
  {
    name: "",
    duration_minutes: "",
    is_barber_busy: true,
  },
]);

setSelectedServiceBarberIds([]);
setShowServiceForm(false);

fetchServices();
showNotice("Usluga je uspješno dodana.", "success");
}
  

  
async function handleDeleteService(id: number) {
  const confirmDelete = confirm("Da li ste sigurni da želite obrisati uslugu?");

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id);

  if (error) {
    showNotice("Greška pri brisanju usluge.");
    console.error(error);
    return;
  }

  fetchServices();
  showNotice("Usluga je obrisana.", "success");
}

 // Avbokning från bokningsrutan. Frågan "Da li ste sigurni" visas i rutan
 // (confirmCancelBooking), och fel visas i rutan i stället för en grå alert.
 async function handleDelete(id: number) {
  setIsCancellingBooking(true);
  setBookingCancelError(null);

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", id);

  setIsCancellingBooking(false);

  if (error) {
    setBookingCancelError("Nije moguće otkazati rezervaciju. Pokušajte ponovo.");
    return;
  }

  // Meddela kunden via e-post (om e-post finns). Bokningen är redan avbokad,
  // så ett misslyckat mejl visar inget fel för salongen.
  const cancelledBooking = bookings.find((booking) => booking.id === id);

  if (cancelledBooking?.email) {
    fetch("/api/send-cancel-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cancelledBooking.email,
        customerName: cancelledBooking.customer_name,
        salon: cancelledBooking.salon,
        service: cancelledBooking.service,
        date: cancelledBooking.booking_date,
        time: cancelledBooking.booking_time,
      }),
    }).catch((mailError) =>
      console.error("Greška pri slanju emaila o otkazivanju:", mailError)
    );
  }

  fetchBookings();
  setSelectedBooking(null);
}

async function handleGalleryImageUpload() {
  if (!galleryFile) {
    showNotice("Prvo odaberite sliku za galeriju.");
    return;
  }

  const safeFileName = galleryFile.name
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-zA-Z0-9._-]/g, "-")
  .replace(/-+/g, "-");

const fileName = `gallery-${salon?.id}-${Date.now()}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("salon-images")
    .upload(fileName, galleryFile);

  if (uploadError) {
    showNotice("Greška pri učitavanju slike u galeriju.");
    console.error(uploadError);
    return;
  }

  const { data } = supabase.storage
    .from("salon-images")
    .getPublicUrl(fileName);

  const imageUrl = data.publicUrl;

  const { error: insertError } = await supabase
    .from("salon_images")
    .insert({
      salon_id: salon?.id,
      image_url: imageUrl,
    });

  if (insertError) {
    showNotice("Slika je učitana, ali nije spremljena u galeriju.");
    console.error(insertError);
    return;
  }

  showNotice("Slika je dodana u galeriju.", "success");

setGalleryFile(null);

fetchGalleryImages();
}
async function handleDeleteGalleryImage(id: number) {
  const confirmDelete = confirm("Da li ste sigurni da želite obrisati sliku iz galerije?");

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("salon_images")
    .delete()
    .eq("id", id);

  if (error) {
    showNotice("Greška pri brisanju slike iz galerije.");
    console.error(error);
    return;
  }

  fetchGalleryImages();
  showNotice("Slika je obrisana iz galerije.", "success");
}
  async function handleImageUpload() {
  setIsUploadingImage(true);

  try {
    if (!selectedFile) {
      showNotice("Prvo odaberite sliku.");
      return;
    }

    if (!imagePreview || !croppedAreaPixels) {
      showNotice("Prvo odaberite područje slike.");
      return;
    }

    const fileName = `salon-x-${Date.now()}-${selectedFile.name}`;

    const croppedBlob = await getCroppedImage(
      imagePreview,
      croppedAreaPixels
    );

    const { error: uploadError } = await supabase.storage
      .from("salon-images")
      .upload(fileName, croppedBlob);

    if (uploadError) {
      showNotice("Greška pri učitavanju slike.");
      console.error(uploadError);
      return;
    }

    const { data } = supabase.storage
      .from("salon-images")
      .getPublicUrl(fileName);

    const imageUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("salons")
      .update({ image_url: imageUrl })
      .eq("id", salon?.id);

    if (updateError) {
      showNotice("Slika je učitana, ali nije spremljena u profil.");
      console.error(updateError);
      return;
    }

    showNotice("Slika je uspješno spremljena.", "success");

        setSalon((prevSalon: any) =>
      prevSalon
        ? {
            ...prevSalon,
            image_url: imageUrl,
          }
        : prevSalon
    );

    setImagePreview(null);
    setSelectedFile(null);
    setCroppedPreviewUrl(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
  } finally {
    setIsUploadingImage(false);
  }
}
async function handleSalonInfoUpdate() {
  const { data: updatedSalon, error } = await supabase
  .from("salons")
.update({
  description: description,
  phone: phone,
  address: address,
  opening_hours:
    openingHoursFrom && openingHoursTo
      ? `${openingHoursFrom}-${openingHoursTo}`
      : "",
      closed_weekdays: closedWeekdays,
  hero_position: heroPosition,
  show_barbers: showBarbers,

  instagram_url: instagramUrl,
  facebook_url: facebookUrl,
  tiktok_url: tiktokUrl,
})
  .eq("id", salon?.id)
  .select("id, show_barbers")
  .single();

console.log("UPPDATERAD SALONG:", updatedSalon);
console.log("SHOW BARBERS STATE:", showBarbers);

  if (error) {
    showNotice("Greška pri spremanju podataka.");
    console.error(error);
    return;
  }

const { error: deleteShortenedHoursError } = await supabase
  .from("salon_shortened_hours")
  .delete()
  .eq("salon_id", salon?.id);

if (deleteShortenedHoursError) {
  console.error(
    "Greška pri brisanju skraćenog radnog vremena:",
    deleteShortenedHoursError
  );
  showNotice("Greška pri spremanju skraćenog radnog vremena.");
  return;
}

if (shortenedHours.length > 0) {
  const shortenedHoursToSave = shortenedHours.map((item) => ({
    salon_id: salon?.id,
    weekday: item.weekday,
    start_time: item.start_time,
    end_time: item.end_time,
  }));

  const { error: shortenedHoursError } = await supabase
    .from("salon_shortened_hours")
    .insert(shortenedHoursToSave);

  if (shortenedHoursError) {
    console.error(
      "Greška pri spremanju skraćenog radnog vremena:",
      shortenedHoursError
    );
    showNotice("Greška pri spremanju skraćenog radnog vremena.");
    return;
  }
}

await fetchShortenedHours();

  showNotice("Podaci su uspješno spremljeni.", "success");
}


function handleAddShortenedHours() {
  if (!shortenedFrom || !shortenedTo) {
    showNotice("Odaberite vrijeme od i do.");
    return;
  }

  if (shortenedFrom >= shortenedTo) {
    showNotice('Vrijeme "Do" mora biti kasnije od vremena "Od".');
    return;
  }

  if (selectedShortenedWeekdays.length === 0) {
    showNotice("Odaberite najmanje jedan dan.");
    return;
  }

  const conflictingClosedDays = selectedShortenedWeekdays.filter((day) =>
    closedWeekdays.includes(day)
  );

  if (conflictingClosedDays.length > 0) {
    showNotice(
      `Nije moguće dodati skraćeno radno vrijeme za neradni dan: ${conflictingClosedDays.join(
        ", "
      )}.`
    );
    return;
  }

  setShortenedHours((prev) => {
    const remaining = prev.filter(
      (item) => !selectedShortenedWeekdays.includes(item.weekday)
    );

    const newItems = selectedShortenedWeekdays.map((day) => ({
      id:
        prev.find((item) => item.weekday === day)?.id ??
        `temp-${day}`,
      salon_id: salon?.id,
      weekday: day,
      start_time: shortenedFrom,
      end_time: shortenedTo,
    }));

    return [...remaining, ...newItems];
  });

  setShortenedFrom("");
  setShortenedTo("");
  setSelectedShortenedWeekdays([]);
  setShowShortenedForm(false);
}

function handleDeleteShortenedHours(id: number | string) {
  const confirmed = window.confirm(
    "Da li ste sigurni da želite obrisati ovo skraćeno radno vrijeme?"
  );

  if (!confirmed) return;

  setShortenedHours((prev) =>
    prev.filter((item) => item.id !== id)
  );
}


useEffect(() => {
  async function fetchSalon() {
    const { data, error } = await supabase
      .from("salons")
      .select("*")
      .eq("slug", salonSlug)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setSalon(data);
setShowBarbers(data.show_barbers ?? false);
  }

  fetchSalon();
}, [salonSlug]);
useEffect(() => {
  if (!selectedDate || !salon?.id) {
    setTimes([]);
    return;
  }

  fetchTimes(selectedDate);
}, [selectedDate, salon?.id]);

useEffect(() => {
  if (!salon?.id) return;

  fetchCalendarAvailableTimes();
}, [calendarWeekStart, salon?.id]);

useEffect(() => {
  if (bookings.length === 0) {
    setCalendarServiceSteps([]);
    return;
  }

  fetchCalendarServiceSteps();
}, [bookings]);

  useEffect(() => {
  if (isLoggedIn && salon?.id) {
    fetchBookings();
    fetchSalonInfo();
    fetchShortenedHours();
    fetchServices();
    fetchServiceCategories();
    fetchTimes();
    fetchBarbers();
    fetchClosedDays();
    fetchNotifications();
    fetchGalleryImages();
  }
}, [isLoggedIn, salon]);

// Hämta nya notiser och bokningar automatiskt varje minut, så att admin inte
// behöver laddas om (en omladdning loggar ut). Bara data – kalenderns kod är orörd.
useEffect(() => {
  if (!isLoggedIn || !salon?.id) return;

  const interval = setInterval(() => {
    fetchNotifications();
    fetchBookings();
  }, 60 * 1000);

  return () => clearInterval(interval);
}, [isLoggedIn, salon]);

useEffect(() => {
  if (!selectedDate || !salon?.id) return;

  fetchTimes(selectedDate);
}, [manualTimeBarberId]);




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



useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      notificationsRef.current &&
      !notificationsRef.current.contains(event.target as Node)
    ) {
      setShowNotifications(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);



// Datum som text ("2026-10-03") i lokal tid – samma form som booking_date.
// (Används bara av statistiken, inte av kalendern.)
const toLocalDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const today = toLocalDateString(new Date());
const currentDate = new Date();

// Statistik "Ova sedmica": måndag–söndag i den här veckan (även på söndagar).
const statsWeekStart = new Date(currentDate);
statsWeekStart.setDate(
  currentDate.getDate() + (currentDate.getDay() === 0 ? -6 : 1 - currentDate.getDay())
);
const statsWeekEnd = new Date(statsWeekStart);
statsWeekEnd.setDate(statsWeekStart.getDate() + 6);
const statsWeekStartString = toLocalDateString(statsWeekStart);
const statsWeekEndString = toLocalDateString(statsWeekEnd);

// Statistik "Ovaj mjesec": hela den här månaden, t.ex. "2026-10".
const statsMonthPrefix = today.slice(0, 7);

const filteredBookings = bookings.filter((booking) => {
  const matchesSalon = booking.salon === salon?.salon_name;

  if (!matchesSalon) return false;

  if (selectedDate) {
    return booking.booking_date === selectedDate;
  }

  if (filter === "today") {
    return booking.booking_date === today;
  }

  if (filter === "week") {
    return (
      booking.booking_date >= statsWeekStartString &&
      booking.booking_date <= statsWeekEndString
    );
  }

  if (filter === "month") {
    return booking.booking_date.startsWith(statsMonthPrefix);
  }

  return true;
});

const todayDate = new Date().toISOString().split("T")[0];

const now = new Date();
const getBookingEndDateTime = (booking: any) => {
  const [hours, minutes] = booking.booking_time.split(":").map(Number);

  const start = new Date(booking.booking_date);
  start.setHours(hours, minutes, 0, 0);

  const duration = booking.duration_minutes || 30;

  return new Date(start.getTime() + duration * 60 * 1000);
};

const activeBookings = filteredBookings.filter(
  (booking) => getBookingEndDateTime(booking) > now
);



const calendarWeekEnd = new Date(calendarWeekStart);
calendarWeekEnd.setDate(calendarWeekStart.getDate() + 6);
calendarWeekEnd.setHours(23, 59, 59, 999);



const currentWeekMonday = new Date(currentDate);
const currentDay = currentDate.getDay();

const diffToMonday =
  currentDay === 0 ? -6 : 1 - currentDay;

currentWeekMonday.setDate(
  currentDate.getDate() + diffToMonday
);
currentWeekMonday.setHours(0, 0, 0, 0);

const isCurrentCalendarWeek =
  calendarWeekStart.getFullYear() === currentWeekMonday.getFullYear() &&
  calendarWeekStart.getMonth() === currentWeekMonday.getMonth() &&
  calendarWeekStart.getDate() === currentWeekMonday.getDate();

const calendarWeekBookings = bookings.filter((booking) => {
  const bookingDate = new Date(`${booking.booking_date}T00:00:00`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isInCurrentWeek =
    bookingDate >= calendarWeekStart &&
    bookingDate <= calendarWeekEnd;

  const matchesBarber =
    calendarBarberFilter === "all" ||
    booking.barber_id === calendarBarberFilter;

  const isTodayOrFuture = bookingDate >= today;

  return (
    isInCurrentWeek &&
    matchesBarber &&
    (showPreviousBookings || isTodayOrFuture)
  );
});



const calendarAvailableTimeMinutes = calendarAvailableTimes.map((item) => {
  const [hours, minutes] = item.time.split(":").map(Number);

  return hours * 60 + minutes;
});

const earliestCalendarTime =
  calendarAvailableTimeMinutes.length > 0
    ? Math.min(...calendarAvailableTimeMinutes)
    : 8 * 60;

const latestCalendarTime =
  calendarAvailableTimeMinutes.length > 0
    ? Math.max(...calendarAvailableTimeMinutes)
    : 20 * 60;

const currentTime = new Date();

const currentTimeMinutes =
  currentTime.getHours() * 60 + currentTime.getMinutes();

const calendarStartMinutes =
  calendarAvailableTimeMinutes.length > 0
    ? earliestCalendarTime
    : 8 * 60;

const calendarTimeDifferences: number[] = [];

const calendarTimesByDate = calendarAvailableTimes.reduce(
  (groups: Record<string, number[]>, item) => {
    const [hours, minutes] = item.time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;

    if (!groups[item.date]) {
      groups[item.date] = [];
    }

    groups[item.date].push(totalMinutes);

    return groups;
  },
  {}
);

Object.values(calendarTimesByDate).forEach((dayTimes) => {
  const sortedTimes = [...dayTimes].sort((a, b) => a - b);

  for (let i = 1; i < sortedTimes.length; i++) {
    const difference = sortedTimes[i] - sortedTimes[i - 1];

    if (difference > 0) {
      calendarTimeDifferences.push(difference);
    }
  }
});

const calendarIntervalMinutes =
  calendarTimeDifferences.length > 0
    ? Math.min(...calendarTimeDifferences)
    : 60;

const calendarEndMinutes =
  calendarAvailableTimeMinutes.length > 0
    ? latestCalendarTime + calendarIntervalMinutes + 60
    : 20 * 60;

const calendarTimeLabels = [];

for (
  let minutes = calendarStartMinutes;
  minutes <= calendarEndMinutes;
  minutes += calendarIntervalMinutes
) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  calendarTimeLabels.push(
    `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
  );
}
const getCalendarTimeMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};


const isCurrentTimeInsideCalendar =
  currentTimeMinutes >= calendarStartMinutes &&
  currentTimeMinutes <= calendarEndMinutes;

const currentTimeTop =
  ((currentTimeMinutes - calendarStartMinutes) / 60) * 80;

function hasThreeOrMoreOverlappingBookings(dateString: string) {
  const dayBookings = calendarWeekBookings.filter(
    (booking) => booking.booking_date === dateString
  );

  for (const booking of dayBookings) {
    let overlappingBookings = [booking];
    let groupChanged = true;

    while (groupChanged) {
      groupChanged = false;

      for (const item of dayBookings) {
        if (
          overlappingBookings.some(
            (groupItem) => groupItem.id === item.id
          )
        ) {
          continue;
        }

        const [itemHour, itemMinute] = item.booking_time
          .split(":")
          .map(Number);

        const itemStart = itemHour * 60 + itemMinute;
        const itemEnd =
          itemStart + (item.duration_minutes || 30);

        const overlapsGroup = overlappingBookings.some(
          (groupItem) => {
            const [groupHour, groupMinute] =
              groupItem.booking_time
                .split(":")
                .map(Number);

            const groupStart =
              groupHour * 60 + groupMinute;

            const groupEnd =
              groupStart +
              (groupItem.duration_minutes || 30);

            return (
              itemStart < groupEnd &&
              itemEnd > groupStart
            );
          }
        );

        if (overlapsGroup) {
          overlappingBookings.push(item);
          groupChanged = true;
        }
      }
    }

    const barberColumns = new Set<string>();

    for (const item of overlappingBookings) {
      const barberKey =
        item.barber_id != null
          ? `barber-${item.barber_id}`
          : `booking-${item.id}`;

      barberColumns.add(barberKey);
    }

    if (barberColumns.size >= 3) {
      return true;
    }
  }

  return false;
}

const calendarDayColumns = Array.from({ length: 7 }).map((_, index) => {
  const date = new Date(calendarWeekStart);
  date.setDate(calendarWeekStart.getDate() + index);

  const today = new Date();

const isToday =
  date.getFullYear() === today.getFullYear() &&
  date.getMonth() === today.getMonth() &&
  date.getDate() === today.getDate();

  const dateString = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  return hasThreeOrMoreOverlappingBookings(dateString)
  ? "1.5fr"
  : "1fr";
});

const calendarGridTemplateColumns =
  `90px ${calendarDayColumns.join(" ")}`;

const todaysBookings = bookings.filter(
  (booking) => booking.booking_date === today
);

function handleGenerateTimes() {
  if (selectedScheduleBarberIds.length === 0) {
    showNotice("Izaberite najmanje jednog člana osoblja.");
    return;
  }

  if (!scheduleStartDate || !scheduleEndDate) {
    showNotice("Odaberite početni i završni datum.");
    return;
  }

  if (!startTime || !endTime) {
    showNotice("Odaberite početno i završno vrijeme.");
    return;
  }

  const startDate = new Date(`${scheduleStartDate}T00:00:00`);
  const endDate = new Date(`${scheduleEndDate}T00:00:00`);

  if (startDate > endDate) {
    showNotice("Početni datum ne može biti nakon završnog datuma.");
    return;
  }

  const startMinutes =
    Number(startTime.split(":")[0]) * 60 +
    Number(startTime.split(":")[1]);

  const endMinutes =
    Number(endTime.split(":")[0]) * 60 +
    Number(endTime.split(":")[1]);

  if (startMinutes >= endMinutes) {
    showNotice("Početno vrijeme mora biti prije završnog vremena.");
    return;
  }

  const interval = Number(intervalMinutes);

  const generatedSlots = [];
  const currentDate = new Date(startDate);
  console.log("scheduleStartDate =", scheduleStartDate);
console.log("startDate =", startDate);
console.log("currentDate =", currentDate);

  const dayNames = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];

  while (currentDate <= endDate) {
    const currentDayName = dayNames[currentDate.getDay()];

    if (selectedDays.includes(currentDayName)) {
      for (
        let currentMinutes = startMinutes;
        currentMinutes < endMinutes;
        currentMinutes += interval
      ) {
        const hours = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;

        const formattedTime = `${String(hours).padStart(2, "0")}:${String(
          minutes
        ).padStart(2, "0")}`;

        generatedSlots.push({
          date: [
  currentDate.getFullYear(),
  String(currentDate.getMonth() + 1).padStart(2, "0"),
  String(currentDate.getDate()).padStart(2, "0"),
].join("-"),
          time: formattedTime,
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  setGeneratedTimes(generatedSlots);
setTimesSaved(false);

console.log("Generisani termini:", generatedSlots);
}


async function handleReplaceTimes() {
  const confirmed = window.confirm(
  "Jeste li sigurni da želite zamijeniti postojeće termine?"
);

if (!confirmed) {
  return;
}
  if (!salon?.id) {
  showNotice("Salon nije pronađen.");
  return;
}

if (selectedScheduleBarberIds.length === 0) {
  showNotice("Izaberite najmanje jednog člana osoblja.");
  return;
}

if (generatedTimes.length === 0) {
  showNotice("Nema generisanih termina.");
  return;
}


const generatedDates = [
  ...new Set(generatedTimes.map((slot) => slot.date)),
];

const { error: deleteError } = await supabase
  .from("available_times")
  .delete()
  .eq("salon_id", salon.id)
  .in("barber_id", selectedScheduleBarberIds)
  .in("date", generatedDates);

if (deleteError) {
  console.error(deleteError);
  showNotice("Greška pri brisanju termina.");
  return;
}

  const timesToSave = selectedScheduleBarberIds.flatMap((barberId) =>
  generatedTimes.map((slot) => ({
    salon_id: salon.id,
    barber_id: barberId,
    date: slot.date,
    time: slot.time,
  }))
);

 const { error: insertError } = await supabase
  .from("available_times")
  .insert(timesToSave);


  if (insertError) {
    console.error(insertError);
    showNotice("Greška pri spremanju termina.");
    return;
  }

  await fetchTimes(scheduleStartDate);
await fetchCalendarAvailableTimes();

showNotice("Termini uspješno zamijenjeni.", "success");
setTimesSaved(true);
}
if (!isLoggedIn) {
  return (
      <main className="min-h-screen flex items-center justify-center bg-[#f7f3ee]">
        <div className="bg-white p-8 rounded-2xl shadow w-96">
          <h1 className="text-2xl font-bold mb-4">Admin prijava</h1>

          <form
  onSubmit={(e) => {
    e.preventDefault();
    handleLogin();
  }}
>
  <input
    type="password"
    placeholder="Lozinka"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full border p-2 rounded mb-4"
  />

  <button
    type="submit"
    className="w-full bg-black text-white p-2 rounded"
  >
    Prijavite se
  </button>
</form>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="mt-4 text-red-600">Nije moguće učitati rezervacije.</p>
      </main>
    );
  }

  return (
    <main
  className="min-h-screen bg-white"
  style={{
    padding: isMobile ? "24px 16px" : "32px",
  }}
>
      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className="flex items-start"
          style={{
            position: "fixed",
            zIndex: 60,
            top: isMobile ? "12px" : "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: isMobile ? "calc(100% - 24px)" : "440px",
            gap: "12px",
            padding: "14px 14px 14px 16px",
            borderRadius: "14px",
            backgroundColor: notice.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${notice.type === "success" ? "#86efac" : "#fca5a5"}`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            color: notice.type === "success" ? "#14532d" : "#7f1d1d",
          }}
        >
          <span
            className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
            style={{
              width: "26px",
              height: "26px",
              fontSize: "14px",
              backgroundColor: notice.type === "success" ? "#16a34a" : "#dc2626",
            }}
          >
            {notice.type === "success" ? "✓" : "!"}
          </span>

          <span
            className="font-semibold"
            style={{ flex: 1, fontSize: "15px", lineHeight: 1.4, paddingTop: "3px" }}
          >
            {notice.text}
          </span>

          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Zatvori"
            className="shrink-0"
            style={{ fontSize: "20px", lineHeight: 1, opacity: 0.6, padding: "2px 4px" }}
          >
            ×
          </button>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        {!isMobile && (
        <div className="mb-6 flex items-start justify-between">
  <div>
    <div>
  <h1 className="text-3xl font-semibold">
    {salon?.salon_name}
  </h1>

  <p
  style={{
    marginTop: "2px",
    fontSize: "18px",
    fontWeight: 600,
    color: "#111827",
  }}
>
  Admin
</p>
</div>

    <p
  className="mt-2"
  style={{
    color: "#6b7280",
    fontSize: "15px",
    fontWeight: 400,
  }}
>
  Upravljajte rezervacijama, uslugama, osobljem i informacijama o salonu.
</p>
  </div>

  

  <div className="flex items-center gap-3">
  <button
  onClick={openSettingsPage}
  className="h-12 rounded-xl px-5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
  style={{
    backgroundColor: "#611a1a",
  }}
>
   Postavke
</button>

  <div
  ref={notificationsRef}
  style={{ position: "relative", display: "inline-block" }}
>
  <button
  onClick={() => setShowNotifications(!showNotifications)}
  className="flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
  style={{ backgroundColor: "#611a1a" }}
>
  <span>Obavijesti</span>

  {notifications.filter((notification) => !notification.is_read).length > 0 && (
    <span
      className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-semibold"
      style={{ color: "#611a1a" }}
    >
      {notifications.filter((notification) => !notification.is_read).length}
    </span>
  )}
</button>
  {showNotifications && (
  <div
    className="z-50 rounded-2xl bg-white p-6 shadow"
   style={{
  position: "absolute",
  top: "100%",
  right: 0,
  marginTop: "8px",
  width: "400px",
  maxHeight: "550px",
  overflowY: "auto",
  border: "1px solid rgba(97, 26, 26, 0.20)",
}}
  >
  <h2
  className="mb-4 flex items-center gap-2 text-xl font-bold"
  style={{ color: "#611a1a" }}
>
  <span>Obavijesti</span>

  {notifications.filter((notification) => !notification.is_read).length > 0 && (
    <span
      className="flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold text-white"
      style={{ backgroundColor: "#611a1a" }}
    >
      {notifications.filter((notification) => !notification.is_read).length}
    </span>
  )}
</h2>

  {notifications.some((notification) => !notification.is_read) && (
    <button
      onClick={markAllNotificationsAsRead}
      className="-mt-2 mb-4 text-sm font-semibold underline"
      style={{ color: "#611a1a" }}
    >
      Označi sve kao pročitano
    </button>
  )}

  {notifications.length === 0 ? (
  <p className="text-sm text-gray-500">
    Nema obavijesti.
  </p>
  ) : (
    <div className="space-y-3">
      {notifications.map((notification) => (
  <div
  key={notification.id}
  className="rounded-xl p-4"
  style={{
    border: "1px solid rgba(97, 26, 26, 0.20)",
    backgroundColor: notification.is_read
  ? "#ffffff"
  : notification.type === "booking_created"
  ? "#f3faf5"
  : "#fdf8f8",
  }}
>
   <div className="flex items-baseline justify-between gap-3">
   <p
  className="font-semibold"
  style={{
    color: notification.is_read ? "#111827" : "#611a1a",
  }}
>
  {notification.title}
</p>
    <span className="shrink-0 text-xs text-gray-400">
      {formatNotificationTime(notification.created_at)}
    </span>
   </div>

    <p className="mt-1 text-sm leading-5 text-gray-600">
  {renderNotificationMessage(notification.message)}
</p>

    {!notification.is_read && (
      <button
  onClick={() =>
    markNotificationAsRead(notification.id)
  }
  className="mt-3 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
  style={{ backgroundColor: "#611a1a" }}
>
  Označi kao pročitano
</button>
    )}
  </div>
))}
    </div>
  )}
</div>
)}
</div>

  <button
  onClick={() => setIsLoggedIn(false)}
  className="h-12 rounded-xl border px-5 text-sm font-medium shadow-sm transition hover:opacity-90"
  style={{
    backgroundColor: "#ffffff",
    color: "#611a1a",
    borderColor: "#611a1a",
  }}
>
  Odjavi se
</button>
</div>
</div>
)}

{isMobile && (
  <div className="mb-6">
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
      }}
    >
      <div
  style={{
    minWidth: 0,
    flex: 1,
    paddingRight: "4px",
  }}
>
  <h1
    style={{
      fontSize: "18px",
      fontWeight: 600,
      lineHeight: 1.25,
      whiteSpace: "normal",
    }}
  >
    {salon?.salon_name}
  </h1>

  <p
    style={{
      marginTop: "4px",
      fontSize: "16px",
      fontWeight: 600,
    }}
  >
    Admin
  </p>

  <p
    style={{
      marginTop: "16px",
      color: "#6b7280",
      fontSize: "15px",
      fontWeight: 400,
      lineHeight: 1.5,
    }}
  >
    Upravljajte rezervacijama, uslugama, osobljem i informacijama o salonu.
  </p>
</div>

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "8px",
    flexShrink: 0,
    width: "105px",
  }}
>
        {/* Mobil: ordningen visas som Postavke, Obavijesti, Odjavi se (order). */}
        <button
          onClick={() => setIsLoggedIn(false)}
          className="rounded-xl border px-2 text-sm font-medium shadow-sm transition hover:opacity-90"
          style={{
            order: 3,
            height: "40px",
            backgroundColor: "#ffffff",
            color: "#611a1a",
            borderColor: "#611a1a",
          }}
        >
          Odjavi se
        </button>

        <div
  ref={notificationsRef}
  style={{
    order: 2,
    position: "relative",
    width: "100%",
  }}
>
  <button
    onClick={() => setShowNotifications(!showNotifications)}
    className="flex w-full items-center justify-center gap-2 rounded-xl px-2 text-sm font-medium text-white shadow-sm"
    style={{
      height: "40px",
      backgroundColor: "#611a1a",
    }}
  >
    <span>Obavijesti</span>

    {notifications.filter((notification) => !notification.is_read).length > 0 && (
      <span
        className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-semibold"
        style={{ color: "#611a1a" }}
      >
        {notifications.filter((notification) => !notification.is_read).length}
      </span>
    )}
  </button>
  {showNotifications && (
  <div
    className="z-50 rounded-2xl bg-white p-4 shadow"
style={{
  position: "absolute",
  top: "100%",
  right: 0,
  marginTop: "8px",
width: "300px",
maxHeight: "420px",
overflowY: "auto",
overflowX: "hidden",
  border: "1px solid rgba(97, 26, 26, 0.20)",
}}
  >
    <h2
      className="mb-4 flex items-center gap-2 text-xl font-bold"
      style={{ color: "#611a1a" }}
    >
      <span>Obavijesti</span>

      {notifications.filter((notification) => !notification.is_read).length > 0 && (
        <span
          className="flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold text-white"
          style={{ backgroundColor: "#611a1a" }}
        >
          {notifications.filter((notification) => !notification.is_read).length}
        </span>
      )}
    </h2>

    {notifications.some((notification) => !notification.is_read) && (
      <button
        onClick={markAllNotificationsAsRead}
        className="-mt-2 mb-3 text-sm font-semibold underline"
        style={{ color: "#611a1a" }}
      >
        Označi sve kao pročitano
      </button>
    )}

    {notifications.length === 0 ? (
      <p className="text-sm text-gray-500">
        Nema obavijesti.
      </p>
    ) : (
<div className="space-y-2">
  {notifications.map((notification) => (
    <div
      key={notification.id}
      className="rounded-xl"
      style={{
        padding: "10px 12px",
        border: "1px solid rgba(97, 26, 26, 0.20)",
        backgroundColor: notification.is_read
          ? "#ffffff"
          : notification.type === "booking_created"
          ? "#f3faf5"
          : "#fdf8f8",
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
      <p
        className="text-sm font-semibold"
        style={{
          color: notification.is_read ? "#111827" : "#611a1a",
        }}
      >
        {notification.title}
      </p>
        <span className="shrink-0 text-xs text-gray-400">
          {formatNotificationTime(notification.created_at)}
        </span>
      </div>

      <p
        className="text-sm text-gray-600"
        style={{
          marginTop: "2px",
          lineHeight: "18px",
        }}
      >
        {renderNotificationMessage(notification.message)}
      </p>

      {!notification.is_read && (
        <button
          onClick={() => markNotificationAsRead(notification.id)}
          className="rounded-lg text-xs font-medium text-white transition hover:opacity-90"
          style={{
            marginTop: "7px",
            padding: "5px 9px",
            backgroundColor: "#611a1a",
          }}
        >
          Označi kao pročitano
        </button>
      )}
    </div>
  ))}
</div>
    )}
  </div>
)}
</div>

<button
  onClick={openSettingsPage}
  className="w-full rounded-xl px-2 text-sm font-medium text-white shadow-sm"
  style={{
    order: 1,
    height: "40px",
    backgroundColor: "#611a1a",
  }}
>
  Postavke
</button>
      </div>
    </div>


  </div>
)}

<div
  className="mb-3 grid grid-cols-2"
  style={{
    gap: isMobile ? "12px" : "24px",
  }}
>
  <div
    className="rounded-2xl border bg-white shadow-sm"
    style={{
      borderColor: "#ead1d1",
      borderLeft: "4px solid #611a1a",
      padding: isMobile ? "14px 16px" : "16px 20px",
height: isMobile ? "90px" : "88px",
    }}
  >
    <p
      className="font-semibold text-gray-500"
      style={{
        fontSize: isMobile ? "13px" : "14px",
        lineHeight: isMobile ? 1.35 : undefined,
      }}
    >
      Današnje rezervacije
    </p>

    <p
      className="font-bold"
      style={{
        marginTop: isMobile ? "8px" : "8px",
        fontSize: isMobile ? "30px" : "36px",
        lineHeight: 1,
        color: "#611a1a",
      }}
    >
      {todaysBookings.length}
    </p>
  </div>

  <div
    className="rounded-2xl border bg-white shadow-sm"
    style={{
      borderColor: "#ead1d1",
      borderLeft: "4px solid #611a1a",
      padding: isMobile ? "14px 16px" : "16px 20px",
      height: isMobile ? "90px" : "88px",
    }}
  >
    <p
      className="font-semibold text-gray-500"
      style={{
        fontSize: isMobile ? "13px" : "14px",
        lineHeight: isMobile ? 1.35 : undefined,
      }}
    >
      {/* Etiketten visar vilket filter under "Statistika" som räknas. */}
      {selectedDate
        ? `Rezervacije ${selectedDate.split("-").reverse().join(".")}`
        : filter === "today"
        ? "Rezervacije danas"
        : filter === "week"
        ? "Rezervacije ove sedmice"
        : filter === "month"
        ? "Rezervacije ovog mjeseca"
        : "Sve rezervacije"}
    </p>

    <p
      className="font-bold"
      style={{
        marginTop: isMobile ? "8px" : "8px",
        fontSize: isMobile ? "30px" : "36px",
        lineHeight: 1,
        color: "#611a1a",
      }}
    >
      {filteredBookings.length}
    </p>
  </div>
</div>

  <div
  className="mb-7"
  style={{
    position: "relative",
    display: "inline-block",
  }}
>
  <button
  onClick={() => {
    const willOpen = !showFilterMenu;

    setShowFilterMenu(willOpen);

    if (willOpen && selectedDate) {
      setShowDateFilter(true);
    }
  }}
  className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:opacity-90"
  style={{
    backgroundColor: "#ffffff",
    color: "#611a1a",
    borderColor: "#611a1a",
  }}
>
  <span className="flex items-center gap-2">
    Statistika

    {filter !== "all" && (
      <span
  style={{
    width: "10px",
    height: "10px",
    borderRadius: "9999px",
    backgroundColor: "#611a1a",
    display: "inline-block",
    flexShrink: 0,
  }}
/>
    )}
  </span>
</button>
  
  {showFilterMenu && (
  <div
  className="mb-8 flex flex-col items-stretch gap-1 rounded-2xl border bg-white p-3 shadow-sm"
 style={{
  position: "absolute",
  top: "100%",
  left: 0,
  marginTop: "8px",
  width: "max-content",
  maxWidth: "calc(100vw - 80px)",
  borderColor: "#ead1d1",
  zIndex: 50,
}}
>
 <button
 onClick={() => {
  setSelectedDate("");
  setShowDateFilter(false);

  if (filter === "today") {
    setFilter("all");
  } else {
    setFilter("today");
  }

  setShowFilterMenu(false);
}}
  className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-gray-100"
  style={{
    color: filter === "today" ? "#611a1a" : "#111827",
    backgroundColor: filter === "today" ? "#f7eeee" : "#ffffff",
  }}
>
  <span className="mr-2 w-4">
    {filter === "today" ? "✓" : ""}
  </span>

  <span>Danas</span>
</button>

  <button
  onClick={() => {
  setSelectedDate("");
  setShowDateFilter(false);

  if (filter === "week") {
    setFilter("all");
  } else {
    setFilter("week");
  }

  setShowFilterMenu(false);
}}
  className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-gray-100"
  style={{
    color: filter === "week" ? "#611a1a" : "#111827",
    backgroundColor: filter === "week" ? "#f7eeee" : "#ffffff",
  }}
>
  <span className="mr-2 w-4">
    {filter === "week" ? "✓" : ""}
  </span>

  <span>Ova sedmica</span>
</button>

<button
  onClick={() => {
  setSelectedDate("");
  setShowDateFilter(false);

  if (filter === "month") {
    setFilter("all");
  } else {
    setFilter("month");
  }

  setShowFilterMenu(false);
}}
  className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-gray-100"
  style={{
    color: filter === "month" ? "#611a1a" : "#111827",
    backgroundColor: filter === "month" ? "#f7eeee" : "#ffffff",
  }}
>
  <span className="mr-2 w-4">
    {filter === "month" ? "✓" : ""}
  </span>

  <span>Ovaj mjesec</span>
</button>



  <div className="mt-2 flex flex-col gap-2">
    <button
  type="button"
  onClick={() => {
  if (selectedDate) {
    setSelectedDate("");
    setFilter("all");
    setShowDateFilter(false);
    setShowFilterMenu(false);
  } else {
    setShowDateFilter(!showDateFilter);
  }
}}
  className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-gray-100"
  style={{
    color: selectedDate ? "#611a1a" : "#111827",
    backgroundColor: selectedDate ? "#f7eeee" : "#ffffff",
  }}
>
  <span className="mr-2 w-4">
    {selectedDate ? "✓" : ""}
  </span>

  <span>Datum</span>
</button>

{showDateFilter && (
  <DatePicker
  ref={datePickerRef}
  popperPlacement={isMobile ? "bottom-start" : undefined}
  selected={
      selectedDate
        ? new Date(`${selectedDate}T00:00:00`)
        : null
    }
    onChange={(date: Date | null) => {
  setSelectedDate(date ? format(date, "yyyy-MM-dd") : "");

  if (date) {
    setFilter("date");
    setShowDateFilter(false);
    setShowFilterMenu(false);
  }
}}
    locale="bs"
    dateFormat="dd.MM.yyyy"
    placeholderText="Odaberite datum"
    formatWeekDay={(dayName) => {
      const days: Record<string, string> = {
        nedjelja: "ned",
        ponedjeljak: "pon",
        utorak: "uto",
        srijeda: "sri",
        sreda: "sri",
        četvrtak: "čet",
        petak: "pet",
        subota: "sub",
      };

      return days[dayName.toLowerCase()] ?? dayName.slice(0, 3);
    }}
    calendarContainer={({ className, children }) => (
      <CalendarContainer className={className}>
        {children}

        <div
          style={{
            padding: "8px",
            borderTop: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setSelectedDate("");
              datePickerRef.current?.setOpen(false);
            }}
            style={{
              color: "#611a1a",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Poništi
          </button>
        </div>
      </CalendarContainer>
    )}
    className="w-full rounded-xl border border-gray-300 bg-white p-2"
  />
)}
    </div>
</div>
)}
</div>

{showSettingsMenu && (
  <div
    id="postavke-stranica"
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 40,
      backgroundColor: "#ffffff",
      overflowY: "auto",
    }}
  >
  <div
    className="mx-auto max-w-6xl"
    style={{
      padding: isMobile ? "24px 16px" : "32px",
    }}
  >
  {selectedSettings.length === 0 ? (
    <>
      <button
        onClick={closeSettingsPage}
        className="rounded-xl border px-5 text-sm font-medium shadow-sm transition hover:opacity-90"
        style={{
          height: isMobile ? "40px" : "48px",
          backgroundColor: "#ffffff",
          color: "#611a1a",
          borderColor: "#611a1a",
        }}
      >
        ← Nazad na kalendar
      </button>

      <h1
        className="font-semibold"
        style={{
          marginTop: isMobile ? "20px" : "28px",
          fontSize: isMobile ? "24px" : "30px",
          color: "#111827",
        }}
      >
        Postavke
      </h1>

      <p
        style={{
          marginTop: "4px",
          color: "#6b7280",
          fontSize: "15px",
        }}
      >
        Šta želite promijeniti?
      </p>

      <div
        style={{
          marginTop: isMobile ? "16px" : "24px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "12px" : "16px",
        }}
      >
        {[
          { key: "times", icon: "🗓️", title: "Slobodni termini", text: "Kada klijenti mogu rezervisati" },
          { key: "closed", icon: "🚫", title: "Zatvoreni dani", text: "Godišnji odmor, praznici, bolovanje" },
          { key: "services", icon: "✂️", title: "Usluge", text: "Usluge, cijene i trajanje" },
          { key: "serviceCategories", icon: "📂", title: "Kategorije usluga", text: "Grupe usluga, npr. Šišanje, Brada" },
          { key: "barbers", icon: "👥", title: "Osoblje", text: "Ko radi u salonu" },
          { key: "info", icon: "ℹ️", title: "Informacije o salonu", text: "Adresa, telefon, radno vrijeme, opis" },
          { key: "hero", icon: "🖼️", title: "Naslovna slika", text: "Velika slika na vrhu stranice salona" },
          { key: "gallery", icon: "📷", title: "Galerija", text: "Slike salona" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => openSetting(item.key)}
            className="flex items-center rounded-2xl border bg-white text-left shadow-sm transition hover:bg-gray-50"
            style={{
              gap: "16px",
              padding: isMobile ? "16px" : "20px 24px",
              minHeight: isMobile ? "76px" : "88px",
              borderColor: "#ead1d1",
            }}
          >
            <span
              style={{
                fontSize: isMobile ? "26px" : "30px",
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </span>

            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                className="block font-bold"
                style={{
                  fontSize: isMobile ? "16px" : "17px",
                  color: "#611a1a",
                }}
              >
                {item.title}
              </span>

              <span
                className="block"
                style={{
                  marginTop: "3px",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                {item.text}
              </span>
            </span>

            <span style={{ color: "#611a1a", fontSize: "20px" }}>›</span>
          </button>
        ))}
      </div>
    </>
  ) : (
  <>
    <button
      onClick={backToSettings}
      className="rounded-xl border px-5 text-sm font-medium shadow-sm transition hover:opacity-90"
      style={{
        height: isMobile ? "40px" : "48px",
        marginBottom: isMobile ? "16px" : "24px",
        backgroundColor: "#ffffff",
        color: "#611a1a",
        borderColor: "#611a1a",
      }}
    >
      ← Nazad na postavke
    </button>
  
    {selectedSettings.includes("hero") && (
  <div className="mb-6">
    <h2 className="font-bold" style={{ fontSize: isMobile ? "24px" : "30px" }}>
      Naslovna slika
    </h2>

    <p className="text-gray-500" style={{ marginTop: "4px", fontSize: "15px", lineHeight: 1.4 }}>
      Velika slika na vrhu stranice vašeg salona – prvo što klijenti vide.
    </p>

    <input
      id="hero-image-upload"
      type="file"
      accept="image/*"
      onChange={(e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];

          setSelectedFile(file);
          setImagePreview(URL.createObjectURL(file));
        }
      }}
      style={{ display: "none" }}
    />

    {!selectedFile ? (
      <div
        className="rounded-2xl border bg-white shadow-sm"
        style={{
          marginTop: "16px",
          padding: isMobile ? "16px" : "22px 26px",
          maxWidth: "880px",
          borderColor: "#ead1d1",
        }}
      >
        <p className="font-bold" style={{ fontSize: "17px", color: "#611a1a" }}>
          Trenutna slika
        </p>

        {salon?.image_url ? (
          <>
            <p className="text-gray-500" style={{ marginTop: "2px", fontSize: "13px" }}>
              Ovako je klijenti vide na vrhu stranice salona.
            </p>

            <img
              src={salon.image_url}
              alt="Naslovna slika"
              className="aspect-[1000/360] w-full rounded-2xl border border-gray-200 object-cover"
              style={{ marginTop: "12px", backgroundColor: "#ffffff" }}
            />
          </>
        ) : (
          <p className="text-gray-500" style={{ marginTop: "6px", fontSize: "15px" }}>
            Salon još nema naslovnu sliku.
          </p>
        )}

        <label
          htmlFor="hero-image-upload"
          className="inline-flex cursor-pointer items-center rounded-xl font-bold text-white transition hover:opacity-90"
          style={{
            marginTop: "14px",
            height: "48px",
            padding: "0 22px",
            gap: "8px",
            fontSize: "15px",
            backgroundColor: "#611a1a",
          }}
        >
          📷 {salon?.image_url ? "Promijeni sliku" : "Izaberite sliku"}
        </label>

        <div
          className="rounded-xl text-gray-600"
          style={{
            marginTop: "14px",
            padding: "12px 14px",
            fontSize: "14px",
            lineHeight: 1.45,
            backgroundColor: "#faf7f7",
          }}
        >
          💡 Savjet: najbolje izgleda široka, svijetla fotografija salona, snimljena
          vodoravno. Nakon izbora možete odabrati koji dio slike se vidi.
        </div>
      </div>
    ) : (
      <div
        className="rounded-2xl border-2 bg-white"
        style={{
          marginTop: "16px",
          padding: isMobile ? "16px" : "22px 26px",
          maxWidth: "880px",
          borderColor: "#611a1a",
        }}
      >
        <p className="font-bold" style={{ fontSize: "17px", color: "#611a1a" }}>
          Nova naslovna slika
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "0" : "24px",
          }}
        >
          <div className="flex" style={{ gap: "12px", marginTop: "16px" }}>
            <div
              className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
              style={{ width: "28px", height: "28px", fontSize: "14px", backgroundColor: "#611a1a" }}
            >
              1
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="font-bold" style={{ fontSize: "16px" }}>
                Odaberite dio slike
              </p>

              <p className="text-gray-500" style={{ marginTop: "2px", fontSize: "13px" }}>
                Pomjerite sliku prstom ili mišem. Uvećajte klizačem.
              </p>

              {imagePreview && (
                <>
                  <div
                    className="relative w-full overflow-hidden rounded-2xl bg-gray-100"
                    style={{
                      marginTop: "10px",
                      height: isMobile ? "220px" : "300px",
                    }}
                  >
    <Cropper
      image={imagePreview}
      crop={crop}
      zoom={zoom}
      aspect={1000 / 360}
      onCropChange={setCrop}
      onZoomChange={setZoom}
      onCropComplete={async (_, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);

        if (!imagePreview) return;

        try {
          const previewUrl = await createCroppedPreview(
            imagePreview,
            croppedAreaPixels
          );

          setCroppedPreviewUrl(previewUrl);
        } catch (error) {
          console.error("Preview error:", error);
        }
      }}
        />
                  </div>

                  <div className="flex items-center" style={{ marginTop: "12px", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setZoom(Math.max(1, Math.round((zoom - 0.2) * 10) / 10))}
                      aria-label="Smanji"
                      className="flex shrink-0 items-center justify-center rounded-full border bg-white font-bold"
                      style={{ width: "40px", height: "40px", fontSize: "20px", color: "#611a1a", borderColor: "#d1d5db" }}
                    >
                      −
                    </button>

                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      aria-label="Uvećanje"
                      className="w-full"
                      style={{ accentColor: "#611a1a" }}
                    />

                    <button
                      type="button"
                      onClick={() => setZoom(Math.min(3, Math.round((zoom + 0.2) * 10) / 10))}
                      aria-label="Uvećaj"
                      className="flex shrink-0 items-center justify-center rounded-full border bg-white font-bold"
                      style={{ width: "40px", height: "40px", fontSize: "20px", color: "#611a1a", borderColor: "#d1d5db" }}
                    >
                      +
                    </button>
                  </div>

                  <p className="text-center text-gray-500" style={{ marginTop: "4px", fontSize: "12px" }}>
                    Uvećanje
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex" style={{ gap: "12px", marginTop: "16px" }}>
            <div
              className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
              style={{ width: "28px", height: "28px", fontSize: "14px", backgroundColor: "#611a1a" }}
            >
              2
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="font-bold" style={{ fontSize: "16px" }}>
                Ovako će izgledati
              </p>

              <p className="text-gray-500" style={{ marginTop: "2px", fontSize: "13px" }}>
                Pregled vrha stranice salona.
              </p>

              <div
                className="aspect-[1000/360] w-full overflow-hidden rounded-2xl bg-gray-200"
                style={{ marginTop: "10px" }}
              >
                {croppedPreviewUrl && (
                  <img
                    src={croppedPreviewUrl}
                    alt="Hero preview"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <p className="text-gray-500" style={{ marginTop: "6px", fontSize: "12px", wordBreak: "break-all" }}>
                {selectedFile.name}
              </p>
            </div>
          </div>
        </div>

        <div
          className="flex"
          style={{
            marginTop: "18px",
            gap: "10px",
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <button
            type="button"
            onClick={handleImageUpload}
            disabled={isUploadingImage}
            className={`rounded-xl font-bold text-white transition ${
              isUploadingImage ? "cursor-not-allowed" : "hover:opacity-90"
            }`}
            style={{
              height: "50px",
              padding: isMobile ? undefined : "0 28px",
              fontSize: "16px",
              backgroundColor: isUploadingImage ? "#6b7280" : "#611a1a",
            }}
          >
            {isUploadingImage ? "Spremanje..." : "Sačuvaj sliku"}
          </button>

          <button
            type="button"
            onClick={() => {
              setImagePreview(null);
              setSelectedFile(null);
              setZoom(1);
              setCrop({ x: 0, y: 0 });
              setCroppedAreaPixels(null);

              const fileInput = document.getElementById(
                "hero-image-upload"
              ) as HTMLInputElement | null;

              if (fileInput) fileInput.value = "";
            }}
            className="rounded-xl border bg-white font-bold transition hover:bg-gray-50"
            style={{
              height: "50px",
              padding: isMobile ? undefined : "0 28px",
              fontSize: "16px",
              color: "#374151",
              borderColor: "#d1d5db",
            }}
          >
            Odustani
          </button>
        </div>
      </div>
    )}
  </div>
)}

{selectedSettings.includes("gallery") && (
  <div className="mb-6">
    <h2 className="font-bold" style={{ fontSize: isMobile ? "24px" : "30px" }}>
      Galerija
    </h2>

    <p className="text-gray-500" style={{ marginTop: "4px", fontSize: "15px", lineHeight: 1.4 }}>
      Slike koje klijenti vide na stranici salona.
    </p>

    <input
      id="gallery-image-upload"
      type="file"
      accept="image/*"
      onChange={(e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];

          setGalleryFile(file);
          setGalleryPreviewUrl(URL.createObjectURL(file));
        }
      }}
      style={{ display: "none" }}
    />

    {!galleryFile ? (
      <div
        className="rounded-2xl text-center"
        style={{
          marginTop: "16px",
          padding: isMobile ? "22px 16px" : "28px",
          maxWidth: "880px",
          border: "2px dashed #c9a3a3",
          backgroundColor: "#fdf8f8",
        }}
      >
        <div style={{ fontSize: "34px", lineHeight: 1 }}>📷</div>

        <p className="font-bold" style={{ marginTop: "8px", fontSize: "17px", color: "#611a1a" }}>
          Dodaj novu sliku
        </p>

        <p className="text-gray-500" style={{ marginTop: "4px", fontSize: "14px" }}>
          Izaberite sliku sa telefona ili računara.
        </p>

        <label
          htmlFor="gallery-image-upload"
          className="inline-flex cursor-pointer items-center rounded-xl font-bold text-white transition hover:opacity-90"
          style={{
            marginTop: "12px",
            height: "46px",
            padding: "0 22px",
            fontSize: "15px",
            backgroundColor: "#611a1a",
          }}
        >
          Izaberite sliku
        </label>
      </div>
    ) : (
      <div
        className="rounded-2xl border-2 bg-white"
        style={{
          marginTop: "16px",
          padding: isMobile ? "16px" : "20px 24px",
          maxWidth: "880px",
          borderColor: "#611a1a",
        }}
      >
        <p className="font-bold" style={{ fontSize: "17px", color: "#611a1a" }}>
          Nova slika
        </p>

        <div className="flex items-start" style={{ marginTop: "12px", gap: "14px" }}>
          {galleryPreviewUrl && (
            <img
              src={galleryPreviewUrl}
              alt="Pregled odabrane slike"
              style={{
                width: isMobile ? "140px" : "200px",
                height: isMobile ? "105px" : "150px",
                objectFit: "cover",
                borderRadius: "12px",
                display: "block",
                flexShrink: 0,
              }}
            />
          )}

          <div style={{ minWidth: 0 }}>
            <p className="font-bold" style={{ fontSize: "15px" }}>
              Odabrana slika
            </p>

            <p className="text-gray-600" style={{ marginTop: "4px", fontSize: "14px", wordBreak: "break-all" }}>
              {galleryFile.name}
            </p>
          </div>
        </div>

        <div
          className="flex"
          style={{
            marginTop: "14px",
            gap: "10px",
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <button
            type="button"
            onClick={handleGalleryImageUpload}
            className="rounded-xl font-bold text-white transition hover:opacity-90"
            style={{
              height: "48px",
              padding: isMobile ? undefined : "0 26px",
              fontSize: "15px",
              backgroundColor: "#611a1a",
            }}
          >
            Sačuvaj u galeriju
          </button>

          <button
            type="button"
            onClick={() => {
              setGalleryFile(null);
              setGalleryPreviewUrl(null);

              const fileInput = document.getElementById(
                "gallery-image-upload"
              ) as HTMLInputElement | null;

              if (fileInput) fileInput.value = "";
            }}
            className="rounded-xl border bg-white font-bold transition hover:bg-gray-50"
            style={{
              height: "48px",
              padding: isMobile ? undefined : "0 26px",
              fontSize: "15px",
              color: "#374151",
              borderColor: "#d1d5db",
            }}
          >
            Odustani
          </button>
        </div>
      </div>
    )}

    <div
      className="flex items-baseline gap-2"
      style={{ marginTop: "22px", paddingBottom: "8px", borderBottom: "1px solid #ead1d1" }}
    >
      <p className="font-bold" style={{ fontSize: "17px", color: "#611a1a" }}>
        Slike u galeriji
      </p>

      <span className="text-sm text-gray-500">
        {galleryImages.length === 1 ? "1 slika" : `${galleryImages.length} slika`}
      </span>
    </div>

    {galleryImages.length === 0 ? (
      <p className="text-gray-500" style={{ marginTop: "12px", fontSize: "15px" }}>
        Još nema slika u galeriji.
      </p>
    ) : (
      <>
        <p className="text-gray-500" style={{ marginTop: "8px", fontSize: "13px" }}>
          Slike se prikazuju na stranici salona ovim redom. Slika 1 se vidi prva.
        </p>

        <div
          style={{
            marginTop: "12px",
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, 1fr)",
            gap: isMobile ? "10px" : "14px",
          }}
        >
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className="relative overflow-hidden rounded-2xl"
              style={{
                aspectRatio: "4 / 3",
                backgroundColor: "#f3f4f6",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <img
                src={image.image_url}
                alt="Slika galerije"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <span
                className="absolute flex items-center justify-center rounded-full font-bold"
                style={{
                  top: "8px",
                  left: "8px",
                  minWidth: "26px",
                  height: "26px",
                  padding: "0 7px",
                  fontSize: "13px",
                  backgroundColor: index === 0 ? "#611a1a" : "rgba(255,255,255,0.92)",
                  color: index === 0 ? "#ffffff" : "#111827",
                }}
              >
                {index + 1}
              </span>

              <button
                type="button"
                onClick={() => handleDeleteGalleryImage(image.id)}
                className="absolute flex items-center rounded-full font-bold"
                style={{
                  top: "8px",
                  right: "8px",
                  height: "32px",
                  padding: "0 10px",
                  gap: "4px",
                  fontSize: "13px",
                  color: "#ef4444",
                  backgroundColor: "rgba(255,255,255,0.95)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                }}
              >
                ✕ Obriši
              </button>
            </div>
          ))}
        </div>
      </>
    )}

    <div
      className="rounded-xl text-gray-600"
      style={{
        marginTop: "16px",
        padding: "12px 14px",
        maxWidth: "880px",
        fontSize: "14px",
        lineHeight: 1.45,
        backgroundColor: "#faf7f7",
      }}
    >
      💡 Savjet: koristite svijetle i oštre slike – izgled salona, vaše radove i tim.
    </div>
  </div>
)}

{selectedSettings.includes("info") && (
  <div className="mb-6" style={{ paddingBottom: "90px" }}>
    <h2 className="font-bold" style={{ fontSize: isMobile ? "24px" : "30px" }}>
      Informacije o salonu
    </h2>

    <p className="text-gray-500" style={{ marginTop: "4px", fontSize: "15px", lineHeight: 1.4 }}>
      Podaci koje klijenti vide na stranici vašeg salona.
    </p>

    <div
      style={{
        marginTop: "16px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? "16px" : "24px",
        alignItems: "start",
      }}
    >
      <div style={{ display: "grid", gap: isMobile ? "16px" : "24px" }}>
      <div
        className="rounded-2xl border bg-white shadow-sm"
        style={{ padding: isMobile ? "16px" : "22px 24px", borderColor: "#ead1d1" }}
      >
        <p className="font-bold" style={{ fontSize: "17px", color: "#611a1a" }}>
          📝 O salonu
        </p>

        <label className="mb-1.5 block text-sm font-bold text-gray-700" style={{ marginTop: "14px" }}>
          Opis
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="block w-full rounded-xl border border-gray-300 px-3 py-3 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
          style={{ fontSize: "15px", lineHeight: 1.45 }}
        />

        <p className="text-gray-500" style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.4 }}>
          Nekoliko rečenica o salonu – šta radite i po čemu ste posebni.
        </p>

        <label className="mb-1.5 block text-sm font-bold text-gray-700" style={{ marginTop: "14px" }}>
          Telefon
        </label>

        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-3 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
          style={{ height: "46px", fontSize: "16px" }}
        />

        <p className="text-gray-500" style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.4 }}>
          Klijenti vas mogu pozvati jednim dodirom sa stranice salona.
        </p>

        <label className="mb-1.5 block text-sm font-bold text-gray-700" style={{ marginTop: "14px" }}>
          Adresa
        </label>

        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-3 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
          style={{ height: "46px", fontSize: "16px" }}
        />

        <p className="text-gray-500" style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.4 }}>
          Ako promijenite adresu, javite Salonixu da ažurira lokaciju na karti.
        </p>
      </div>

      <div
        className="rounded-2xl border bg-white shadow-sm"
        style={{ padding: isMobile ? "16px" : "22px 24px", borderColor: "#ead1d1" }}
      >
        <p className="font-bold" style={{ fontSize: "17px", color: "#611a1a" }}>
          🔗 Društvene mreže <span className="font-normal text-gray-500" style={{ fontSize: "13px" }}>(nije obavezno)</span>
        </p>

        <div className="flex items-center" style={{ gap: "10px", marginTop: "14px" }}>
          <span
            aria-hidden="true"
            className="flex shrink-0 items-center justify-center rounded-xl font-bold text-white"
            style={{ width: "38px", height: "38px", fontSize: "15px", background: "linear-gradient(45deg, #f58529, #dd2a7b, #8134af)" }}
          >
            IG
          </span>

          <input
            type="text"
            aria-label="Instagram"
            placeholder="https://instagram.com/..."
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
            style={{ height: "46px", fontSize: "15px", minWidth: 0 }}
          />
        </div>

        <div className="flex items-center" style={{ gap: "10px", marginTop: "14px" }}>
          <span
            aria-hidden="true"
            className="flex shrink-0 items-center justify-center rounded-xl font-bold text-white"
            style={{ width: "38px", height: "38px", fontSize: "15px", background: "#1877f2" }}
          >
            f
          </span>

          <input
            type="text"
            aria-label="Facebook"
            placeholder="https://facebook.com/..."
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
            style={{ height: "46px", fontSize: "15px", minWidth: 0 }}
          />
        </div>

        <div className="flex items-center" style={{ gap: "10px", marginTop: "14px" }}>
          <span
            aria-hidden="true"
            className="flex shrink-0 items-center justify-center rounded-xl font-bold text-white"
            style={{ width: "38px", height: "38px", fontSize: "15px", background: "#111111" }}
          >
            ♪
          </span>

          <input
            type="text"
            aria-label="TikTok"
            placeholder="https://tiktok.com/@..."
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
            style={{ height: "46px", fontSize: "15px", minWidth: 0 }}
          />
        </div>
      </div>
      </div>

      <div
        className="rounded-2xl border bg-white shadow-sm"
        style={{ padding: isMobile ? "16px" : "22px 24px", borderColor: "#ead1d1" }}
      >
        <p className="font-bold" style={{ fontSize: "17px", color: "#611a1a" }}>
          🕘 Radno vrijeme
        </p>

        <label className="mb-1.5 block text-sm font-bold text-gray-700" style={{ marginTop: "14px" }}>
          Uobičajeno radno vrijeme
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
            <div style={{ minWidth: 0 }}>
              <label className="mb-1 block text-xs text-gray-500">Od</label>
              <input
                type="time"
                value={openingHoursFrom}
                onChange={(e) => setOpeningHoursFrom(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 bg-white text-left shadow-sm [&::-webkit-date-and-time-value]:m-0 [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:leading-[44px]"
                style={{
                height: "46px",
                lineHeight: "44px",
                padding: "0 10px",
                fontSize: "16px",
                minWidth: 0,
                maxWidth: "100%",
                WebkitAppearance: "none",
                appearance: "none",
              }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <label className="mb-1 block text-xs text-gray-500">Do</label>
              <input
                type="time"
                value={openingHoursTo}
                onChange={(e) => setOpeningHoursTo(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 bg-white text-left shadow-sm [&::-webkit-date-and-time-value]:m-0 [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:leading-[44px]"
                style={{
                height: "46px",
                lineHeight: "44px",
                padding: "0 10px",
                fontSize: "16px",
                minWidth: 0,
                maxWidth: "100%",
                WebkitAppearance: "none",
                appearance: "none",
              }}
              />
            </div>
          </div>

        <label className="mb-1.5 block text-sm font-bold text-gray-700" style={{ marginTop: "14px" }}>
          Neradni dani
        </label>

        <div className="flex flex-wrap gap-2">
            {["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"].map((day) => {
              const isSelected = closedWeekdays.includes(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() =>
                    setClosedWeekdays((prev) =>
                      prev.includes(day)
                        ? prev.filter((item) => item !== day)
                        : [...prev, day]
                    )
                  }
                  className="rounded-full border transition"
                  style={{
                    height: "38px",
                    minWidth: "52px",
                    padding: "0 12px",
                    fontSize: "14px",
                    fontWeight: isSelected ? 600 : 400,
                    backgroundColor: isSelected ? "#611a1a" : "#ffffff",
                    borderColor: isSelected ? "#611a1a" : "#d1d5db",
                    color: isSelected ? "#ffffff" : "#111827",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

        <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid #f3e8e8" }}>
          <p className="font-bold" style={{ fontSize: "15px" }}>
            Skraćeno radno vrijeme
          </p>

          <p className="text-gray-500" style={{ marginTop: "2px", fontSize: "13px" }}>
            Dani kada salon radi kraće, npr. subotom.
          </p>

          {shortenedHours.map((item) => {
            const dayNames: Record<string, string> = {
              Pon: "Ponedjeljak",
              Uto: "Utorak",
              Sri: "Srijeda",
              Čet: "Četvrtak",
              Pet: "Petak",
              Sub: "Subota",
              Ned: "Nedjelja",
            };

            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border"
                style={{ marginTop: "10px", padding: "10px 12px", borderColor: "#ead1d1", gap: "10px" }}
              >
                <div style={{ minWidth: 0 }}>
                  <p className="font-bold" style={{ fontSize: "15px" }}>
                    {dayNames[item.weekday] || item.weekday}
                  </p>

                  <p className="text-gray-500" style={{ fontSize: "13px", marginTop: "2px" }}>
                    {String(item.start_time).slice(0, 5)}–{String(item.end_time).slice(0, 5)}
                    {String(item.id).startsWith("temp-") && (
                      <span style={{ color: "#b45309", fontWeight: 600 }}> · još nije sačuvano</span>
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteShortenedHours(item.id)}
                  className="shrink-0 rounded-xl border bg-white font-semibold"
                  style={{ height: "34px", padding: "0 12px", fontSize: "13px", color: "#ef4444", borderColor: "#ef4444" }}
                >
                  Obriši
                </button>
              </div>
            );
          })}

          {!showShortenedForm ? (
            <button
              type="button"
              onClick={() => setShowShortenedForm(true)}
              className="rounded-xl font-bold"
              style={{
                marginTop: "10px",
                height: "44px",
                padding: "0 18px",
                width: isMobile ? "100%" : undefined,
                fontSize: "15px",
                color: "#611a1a",
                border: "1px dashed #611a1a",
                backgroundColor: "#ffffff",
              }}
            >
              + Dodaj skraćeno radno vrijeme
            </button>
          ) : (
            <div
              className="rounded-xl"
              style={{ marginTop: "10px", padding: "12px", backgroundColor: "#faf7f7" }}
            >
              <label className="mb-1.5 block text-sm font-bold text-gray-700">
                Koji dani?
              </label>

              <div className="flex flex-wrap gap-2">
            {["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"].map((day) => {
              const isSelected = selectedShortenedWeekdays.includes(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() =>
                    setSelectedShortenedWeekdays((prev) =>
                      prev.includes(day)
                        ? prev.filter((item) => item !== day)
                        : [...prev, day]
                    )
                  }
                  className="rounded-full border transition"
                  style={{
                    height: "38px",
                    minWidth: "52px",
                    padding: "0 12px",
                    fontSize: "14px",
                    fontWeight: isSelected ? 600 : 400,
                    backgroundColor: isSelected ? "#611a1a" : "#ffffff",
                    borderColor: isSelected ? "#611a1a" : "#d1d5db",
                    color: isSelected ? "#ffffff" : "#111827",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

              <label className="mb-1.5 block text-sm font-bold text-gray-700" style={{ marginTop: "12px" }}>
                Radno vrijeme tih dana
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
            <div style={{ minWidth: 0 }}>
              <label className="mb-1 block text-xs text-gray-500">Od</label>
              <input
                type="time"
                value={shortenedFrom}
                onChange={(e) => setShortenedFrom(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 bg-white text-left shadow-sm [&::-webkit-date-and-time-value]:m-0 [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:leading-[44px]"
                style={{
                height: "46px",
                lineHeight: "44px",
                padding: "0 10px",
                fontSize: "16px",
                minWidth: 0,
                maxWidth: "100%",
                WebkitAppearance: "none",
                appearance: "none",
              }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <label className="mb-1 block text-xs text-gray-500">Do</label>
              <input
                type="time"
                value={shortenedTo}
                onChange={(e) => setShortenedTo(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 bg-white text-left shadow-sm [&::-webkit-date-and-time-value]:m-0 [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:leading-[44px]"
                style={{
                height: "46px",
                lineHeight: "44px",
                padding: "0 10px",
                fontSize: "16px",
                minWidth: 0,
                maxWidth: "100%",
                WebkitAppearance: "none",
                appearance: "none",
              }}
              />
            </div>
          </div>

              <div className="flex" style={{ marginTop: "12px", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleAddShortenedHours}
                  className="rounded-xl font-bold text-white"
                  style={{ height: "44px", padding: "0 18px", fontSize: "15px", backgroundColor: "#611a1a" }}
                >
                  Dodaj
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowShortenedForm(false);
                    setShortenedFrom("");
                    setShortenedTo("");
                    setSelectedShortenedWeekdays([]);
                  }}
                  className="rounded-xl border bg-white font-bold"
                  style={{ height: "44px", padding: "0 18px", fontSize: "15px", color: "#374151", borderColor: "#d1d5db" }}
                >
                  Odustani
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 45,
        backgroundColor: "#ffffff",
        borderTop: "1px solid #ead1d1",
        boxShadow: "0 -4px 14px rgba(0,0,0,0.06)",
        padding: isMobile ? "10px 16px" : "12px 32px",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center" style={{ gap: "12px" }}>
        <p className="text-gray-500" style={{ flex: 1, fontSize: "13px", lineHeight: 1.35 }}>
          Promjene se čuvaju tek kada kliknete „Sačuvaj“.
        </p>

        <button
          type="button"
          onClick={handleSalonInfoUpdate}
          className="rounded-xl font-bold text-white transition hover:opacity-90"
          style={{ height: "48px", padding: "0 22px", fontSize: "15px", backgroundColor: "#611a1a", whiteSpace: "nowrap" }}
        >
          Sačuvaj promjene
        </button>
      </div>
    </div>
  </div>
)}

{selectedSettings.includes("serviceCategories") && (() => {
  const categorySuggestions = [
    "Šišanje",
    "Muško šišanje",
    "Žensko šišanje",
    "Dječije šišanje",
    "Šišanje i brada",
    "Fade",
    "Brada",
    "Uređivanje brade",
    "Brijanje",
    "Farbanje",
    "Pramenovi",
    "Pranje i feniranje",
    "Tretmani za kosu",
    "Manikir",
    "Pedikir",
    "Gel nokti",
    "Trepavice",
    "Obrve",
    "Depilacija",
    "Masaža",
    "Njega lica",
    "Šminkanje",
  ];

  const existingNames = serviceCategories.map((category) =>
    String(category.name || "").trim().toLowerCase()
  );

  const visibleSuggestions = categorySuggestions.filter(
    (name) => !existingNames.includes(name.toLowerCase())
  );

  return (
  <div className="mb-6">
    <h2 className="font-bold" style={{ fontSize: isMobile ? "24px" : "30px" }}>
      Kategorije usluga
    </h2>

    <p className="text-gray-500" style={{ marginTop: "4px", fontSize: "15px", lineHeight: 1.4 }}>
      Grupe u koje su podijeljene vaše usluge na stranici salona, npr. Šišanje, Brada.
    </p>

    <div
      className="rounded-2xl border bg-white shadow-sm"
      style={{
        marginTop: "16px",
        padding: isMobile ? "16px" : "22px 24px",
        maxWidth: "640px",
        borderColor: "#ead1d1",
      }}
    >
      <div className="flex items-baseline gap-2" style={{ paddingBottom: "10px" }}>
        <p className="font-bold" style={{ fontSize: "17px", color: "#611a1a" }}>
          Vaše kategorije
        </p>

        <span className="text-sm text-gray-500">{serviceCategories.length}</span>
      </div>

      {serviceCategories.length === 0 && (
        <p
          className="text-gray-500"
          style={{ padding: "12px 0", fontSize: "15px", borderTop: "1px solid #f3e8e8" }}
        >
          Još nema kategorija. Izaberite neku ispod ili upišite svoju.
        </p>
      )}

      {serviceCategories.map((category) => {
        const serviceCount = services.filter(
          (service) => service.category_id === category.id
        ).length;

        return (
          <div
            key={category.id}
            className="flex items-center"
            style={{ gap: "12px", padding: "12px 0", borderTop: "1px solid #f3e8e8" }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="font-bold" style={{ fontSize: "16px" }}>
                {category.name}
              </p>

              <p
                style={{
                  marginTop: "2px",
                  fontSize: "13px",
                  color: serviceCount > 0 ? "#6b7280" : "#b45309",
                }}
              >
                {serviceCount > 0
                  ? uslugaLabel(serviceCount)
                  : "Prazna – klijenti je ne vide"}
              </p>
            </div>

            {serviceCount > 0 ? (
              <p
                className="text-right text-gray-400"
                style={{ fontSize: "12px", lineHeight: 1.3, maxWidth: "110px" }}
              >
                Ima usluge – ne može se obrisati
              </p>
            ) : (
              <button
                type="button"
                onClick={() => handleDeleteServiceCategory(category.id)}
                className="shrink-0 rounded-xl border bg-white font-semibold"
                style={{
                  height: "34px",
                  padding: "0 12px",
                  fontSize: "13px",
                  color: "#ef4444",
                  borderColor: "#ef4444",
                }}
              >
                Obriši
              </button>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: "6px", paddingTop: "14px", borderTop: "1px solid #f3e8e8" }}>
        <p className="text-sm font-bold text-gray-700">
          Dodaj novu kategoriju
        </p>

        {visibleSuggestions.length > 0 && (
          <>
            <p className="font-bold text-gray-700" style={{ marginTop: "12px", fontSize: "14px" }}>
              Brzi izbor
            </p>

            <p className="text-gray-500" style={{ marginTop: "2px", fontSize: "13px" }}>
              Dodirnite i kategorija se odmah dodaje.
            </p>

            <div className="flex flex-wrap" style={{ marginTop: "8px", gap: "8px" }}>
              {visibleSuggestions.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleAddServiceCategory(name)}
                  className="inline-flex items-center rounded-full font-semibold transition hover:opacity-80"
                  style={{
                    height: "38px",
                    padding: "0 14px",
                    fontSize: "14px",
                    color: "#611a1a",
                    border: "1px dashed #611a1a",
                    backgroundColor: "#fdf8f8",
                  }}
                >
                  + {name}
                </button>
              ))}
            </div>

            <div
              className="flex items-center text-gray-400"
              style={{ margin: "14px 0 8px", gap: "8px", fontSize: "13px" }}
            >
              <span style={{ flex: 1, height: "1px", backgroundColor: "#f0e4e4" }} />
              ili upišite svoj naziv
              <span style={{ flex: 1, height: "1px", backgroundColor: "#f0e4e4" }} />
            </div>
          </>
        )}

        <div
          style={{
            marginTop: visibleSuggestions.length > 0 ? "0" : "8px",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "8px",
          }}
        >
          <input
            type="text"
            placeholder="Naziv kategorije"
            value={newServiceCategoryName}
            onChange={(e) => setNewServiceCategoryName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
            style={{ height: "46px", fontSize: "16px", minWidth: 0 }}
          />

          <button
            type="button"
            onClick={() => handleAddServiceCategory()}
            className="rounded-xl font-bold text-white transition hover:opacity-90"
            style={{
              height: "46px",
              padding: "0 18px",
              fontSize: "15px",
              backgroundColor: "#611a1a",
              whiteSpace: "nowrap",
            }}
          >
            + Dodaj
          </button>
        </div>
      </div>
    </div>

    <div
      className="rounded-xl text-gray-600"
      style={{
        marginTop: "14px",
        padding: "12px 14px",
        maxWidth: "640px",
        fontSize: "14px",
        lineHeight: 1.45,
        backgroundColor: "#faf7f7",
      }}
    >
      💡 Usluge dodajete u kategoriju u <b>Postavke → Usluge</b>. Kategorija sa uslugama ne
      može se obrisati – prvo premjestite njene usluge u drugu kategoriju.
    </div>
  </div>
  );
})()}

{selectedSettings.includes("services") && (
  <div className="mb-6 rounded-2xl bg-white p-4 shadow">
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-1 text-xl font-bold">Usluge</h2>
  <p className="mb-6 text-sm text-gray-500">
  Dodajte i uredite usluge koje nudite u svom salonu.
</p>

  <div ref={serviceFormRef}></div>

  {!showServiceForm && editingServiceId === null && (
    <button
      type="button"
      onClick={() => setShowServiceForm(true)}
      className="mb-6 rounded-xl text-white font-semibold shadow-sm transition hover:opacity-90"
      style={{
        backgroundColor: "#611a1a",
        height: "48px",
        width: isMobile ? "100%" : undefined,
        padding: isMobile ? undefined : "0 28px",
        fontSize: "16px",
      }}
    >
      + Dodaj novu uslugu
    </button>
  )}

  {(showServiceForm || editingServiceId !== null) && (
    <div
      className="mb-6 rounded-2xl border bg-white"
      style={{
        borderWidth: "2px",
        borderColor: "#611a1a",
        padding: isMobile ? "16px" : "24px 28px",
        maxWidth: "760px",
      }}
    >
      <h3
        className="mb-4 font-bold"
        style={{ fontSize: "19px", color: "#611a1a" }}
      >
        {editingServiceId !== null ? "Uredi uslugu" : "Nova usluga"}
      </h3>
      <p
        className="text-sm text-gray-500"
        style={{ marginTop: "-10px", marginBottom: "16px" }}
      >
        Popunite polja i kliknite „{editingServiceId !== null ? "Sačuvaj izmjene" : "Sačuvaj uslugu"}“.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "16px" : "16px 20px",
        }}
      >
        <div>
          <label className="mb-1.5 block font-bold" style={{ fontSize: "15px" }}>
            Naziv usluge
          </label>

          <input
            type="text"
            placeholder="npr. Muško šišanje"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
            style={{ height: "48px", fontSize: "16px" }}
          />
        </div>

        <div>
          <label className="mb-1.5 block font-bold" style={{ fontSize: "15px" }}>
            Kategorija
          </label>

          <select
            value={selectedServiceCategoryId}
            onChange={(e) =>
              setSelectedServiceCategoryId(
                e.target.value ? Number(e.target.value) : ""
              )
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
            style={{ height: "48px", fontSize: "16px" }}
          >
            <option value="">Izaberite kategoriju</option>

            {serviceCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <label className="mb-1.5 block font-bold" style={{ fontSize: "15px" }}>
          Opis{" "}
          <span className="font-normal text-gray-500" style={{ fontSize: "13px" }}>
            (nije obavezno)
          </span>
        </label>

        <textarea
          placeholder="npr. šišanje makazama i mašinicom, pranje kose"
          value={serviceDescription}
          onChange={(e) => setServiceDescription(e.target.value)}
          className="block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
          style={{ fontSize: "16px", resize: "none" }}
          rows={3}
        />
      </div>

      <div
        style={{
          marginTop: "16px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: isMobile ? "12px" : "20px",
        }}
      >
        <div>
          <label className="mb-1.5 block font-bold" style={{ fontSize: "15px" }}>
            Cijena
          </label>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="0"
              value={servicePrice}
              onChange={(e) => setServicePrice(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
              style={{ height: "48px", fontSize: "16px", paddingRight: "44px" }}
            />

            <span
              className="text-gray-500"
              style={{ position: "absolute", right: "14px", top: "13px", fontSize: "15px", pointerEvents: "none" }}
            >
              KM
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block font-bold" style={{ fontSize: "15px" }}>
            Trajanje
          </label>

          <div style={{ position: "relative" }}>
            <input
              type="number"
              placeholder="30"
              value={hasServiceSteps ? totalDuration : serviceDuration}
              onChange={(e) => setServiceDuration(e.target.value)}
              disabled={hasServiceSteps}
              className={`w-full rounded-xl border border-gray-300 px-4 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20 ${
                hasServiceSteps ? "cursor-not-allowed bg-gray-100 text-gray-500" : ""
              }`}
              style={{ height: "48px", fontSize: "16px", paddingRight: "44px" }}
            />

            <span
              className="text-gray-500"
              style={{ position: "absolute", right: "14px", top: "13px", fontSize: "15px", pointerEvents: "none" }}
            >
              min
            </span>
          </div>
        </div>
      </div>

      {hasServiceSteps && (
        <p className="text-sm text-gray-500" style={{ marginTop: "6px" }}>
          Trajanje se automatski izračunava na osnovu koraka tretmana.
        </p>
      )}

      <label className="flex items-center gap-2.5" style={{ marginTop: "14px", fontSize: "15px" }}>
        <input
          type="checkbox"
          checked={showPrice}
          onChange={(e) => setShowPrice(e.target.checked)}
          style={{ width: "20px", height: "20px", accentColor: "#611a1a", cursor: "pointer" }}
        />
        Prikaži cijenu klijentima
      </label>

      <label className="flex items-center gap-2.5" style={{ marginTop: "10px", fontSize: "15px" }}>
        <input
          type="checkbox"
          checked={showDuration}
          onChange={(e) => setShowDuration(e.target.checked)}
          style={{ width: "20px", height: "20px", accentColor: "#611a1a", cursor: "pointer" }}
        />
        Prikaži trajanje klijentima
      </label>

      <div style={{ marginTop: "20px" }}>
        <p className="mb-2 font-bold" style={{ fontSize: "15px" }}>
          Ko radi ovu uslugu?
        </p>

        <div className="flex flex-wrap gap-2">
          {barbers.map((barber) => {
            const isSelected = selectedServiceBarberIds.includes(barber.id);

            return (
              <button
                key={barber.id}
                type="button"
                onClick={() => {
                  if (!isSelected) {
                    setSelectedServiceBarberIds((prev) => [...prev, barber.id]);
                  } else {
                    setSelectedServiceBarberIds((prev) =>
                      prev.filter((id) => id !== barber.id)
                    );
                  }
                }}
                className="rounded-full border transition"
                style={{
                  height: "42px",
                  padding: "0 16px",
                  fontSize: "15px",
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected ? "#611a1a" : "#ffffff",
                  borderColor: isSelected ? "#611a1a" : "#d1d5db",
                  color: isSelected ? "#ffffff" : "#111827",
                }}
              >
                {isSelected ? "✓ " : ""}
                {barber.name}
              </button>
            );
          })}
        </div>

        <p className="text-gray-500" style={{ marginTop: "6px", fontSize: "13px" }}>
          Ako nikoga ne označite, klijenti mogu rezervisati kod svih članova osoblja.
        </p>
      </div>

      <div
        className="rounded-xl"
        style={{ marginTop: "20px", padding: "12px 14px", backgroundColor: "#faf7f7" }}
      >
        <label className="flex items-start gap-2.5" style={{ cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={hasServiceSteps}
            onChange={(e) => setHasServiceSteps(e.target.checked)}
            style={{ width: "20px", height: "20px", accentColor: "#611a1a", cursor: "pointer", flexShrink: 0, marginTop: "1px" }}
          />

          <span>
            <span className="block font-bold" style={{ fontSize: "15px" }}>
              Tretman ima pauzu
            </span>

            <span className="block text-gray-500" style={{ fontSize: "13px", marginTop: "2px" }}>
              Npr. farbanje: dok boja djeluje, član osoblja može primiti drugog klijenta.
            </span>
          </span>
        </label>

        {hasServiceSteps && (
          <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #ead1d1" }}>
            <p className="font-bold" style={{ fontSize: "15px" }}>
              Koraci tretmana
            </p>

            <p className="text-gray-500" style={{ fontSize: "13px", marginTop: "2px" }}>
              Upišite korake redom. Tokom pauze drugi klijenti mogu rezervisati kod istog člana osoblja.
            </p>

            {serviceSteps.some((step) => Number(step.duration_minutes) > 0) && (
              <>
                <div
                  className="flex overflow-hidden rounded-full"
                  style={{ marginTop: "12px", height: "12px", gap: "2px" }}
                >
                  {serviceSteps.map((step, index) =>
                    Number(step.duration_minutes) > 0 ? (
                      <div
                        key={index}
                        style={{
                          flex: Number(step.duration_minutes),
                          backgroundColor: step.is_barber_busy ? "#611a1a" : "#e7d3d3",
                        }}
                      />
                    ) : null
                  )}
                </div>

                <div className="flex gap-4 text-gray-600" style={{ marginTop: "6px", fontSize: "12px" }}>
                  <span className="flex items-center gap-1">
                    <span style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: "#611a1a", display: "inline-block" }} />
                    Osoblje radi
                  </span>

                  <span className="flex items-center gap-1">
                    <span style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: "#e7d3d3", display: "inline-block" }} />
                    Pauza
                  </span>
                </div>
              </>
            )}

            {serviceSteps.map((step, index) => (
              <div
                key={index}
                className="rounded-xl border bg-white"
                style={{ marginTop: "12px", padding: "12px", borderColor: "#e5d5d5" }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ fontSize: "14px", color: "#611a1a" }}>
                    Korak {index + 1}
                  </span>

                  {serviceSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const shouldDelete = window.confirm(
                          "Da li ste sigurni da želite izbrisati ovaj korak?"
                        );

                        if (!shouldDelete) return;

                        setServiceSteps(
                          serviceSteps.filter((_, stepIndex) => stepIndex !== index)
                        );
                      }}
                      className="font-semibold"
                      style={{ fontSize: "14px", color: "#ef4444" }}
                    >
                      Obriši
                    </button>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr 80px" : "1fr 140px",
                    gap: "8px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Naziv koraka"
                    value={step.name}
                    onChange={(e) => {
                      const updatedSteps = [...serviceSteps];

                      updatedSteps[index] = {
                        ...updatedSteps[index],
                        name: e.target.value,
                      };

                      setServiceSteps(updatedSteps);
                    }}
                    className="w-full rounded-xl border border-gray-300 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
                    style={{ height: "46px", fontSize: "16px", padding: "0 10px" }}
                  />

                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="0"
                      value={step.duration_minutes}
                      onChange={(e) => {
                        const updatedSteps = [...serviceSteps];

                        updatedSteps[index] = {
                          ...updatedSteps[index],
                          duration_minutes: e.target.value,
                        };

                        setServiceSteps(updatedSteps);
                      }}
                      className="w-full rounded-xl border border-gray-300 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
                      style={{ height: "46px", fontSize: "16px", padding: isMobile ? "0 34px 0 10px" : "0 38px 0 10px" }}
                    />

                    <span
                      className="text-gray-500"
                      style={{ position: "absolute", right: "10px", top: "13px", fontSize: "14px", pointerEvents: "none" }}
                    >
                      min
                    </span>
                  </div>
                </div>

                <div
                  className="overflow-hidden rounded-xl border"
                  style={{
                    marginTop: "10px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    borderColor: "#d1d5db",
                    maxWidth: isMobile ? undefined : "380px",
                  }}
                >
                  {[
                    { busy: true, label: "Osoblje radi" },
                    { busy: false, label: "Pauza" },
                  ].map((option) => {
                    const isActive = step.is_barber_busy === option.busy;

                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => {
                          const updatedSteps = [...serviceSteps];

                          updatedSteps[index] = {
                            ...updatedSteps[index],
                            is_barber_busy: option.busy,
                          };

                          setServiceSteps(updatedSteps);
                        }}
                        style={{
                          height: "40px",
                          fontSize: "14px",
                          fontWeight: isActive ? 600 : 400,
                          backgroundColor: isActive ? "#611a1a" : "#ffffff",
                          color: isActive ? "#ffffff" : "#374151",
                        }}
                      >
                        {isActive ? "✓ " : ""}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                setServiceSteps([
                  ...serviceSteps,
                  {
                    name: "",
                    duration_minutes: "",
                    is_barber_busy: true,
                  },
                ]);
              }}
              className="rounded-xl font-semibold"
              style={{
                marginTop: "12px",
                height: "44px",
                width: isMobile ? "100%" : undefined,
                padding: isMobile ? undefined : "0 22px",
                fontSize: "15px",
                color: "#611a1a",
                border: "1px dashed #611a1a",
                backgroundColor: "#ffffff",
              }}
            >
              + Dodaj korak
            </button>
          </div>
        )}
      </div>

      <div
        className="flex gap-2.5"
        style={{
          marginTop: "22px",
          flexDirection: isMobile ? "column" : "row-reverse",
          justifyContent: isMobile ? undefined : "flex-start",
        }}
      >
        <button
          type="button"
          onClick={handleAddService}
          className="rounded-xl font-semibold text-white transition hover:opacity-90"
          style={{
            backgroundColor: "#611a1a",
            height: "50px",
            padding: isMobile ? undefined : "0 28px",
            fontSize: "16px",
          }}
        >
          {editingServiceId !== null ? "Sačuvaj izmjene" : "Sačuvaj uslugu"}
        </button>

        <button
          type="button"
          onClick={() => {
            handleCancelServiceEdit();

            if (isMobile) {
              setTimeout(() => {
                serviceFormRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }, 50);
            }
          }}
          className="rounded-xl border bg-white font-semibold transition hover:bg-gray-50"
          style={{
            height: "50px",
            padding: isMobile ? undefined : "0 28px",
            fontSize: "16px",
            color: "#374151",
            borderColor: "#d1d5db",
          }}
        >
          Odustani
        </button>
      </div>
    </div>
  )}

  {/* Lista: tjänsterna grupperade efter kategori (bara visning). */}
  {[
    ...serviceCategories.map((category) => ({
      key: String(category.id),
      name: category.name,
      items: services.filter(
        (service) => service.category_id === category.id
      ),
    })),
    {
      key: "none",
      name: "Bez kategorije",
      items: services.filter(
        (service) =>
          !serviceCategories.some(
            (category) => category.id === service.category_id
          )
      ),
    },
  ]
    .filter((group) => group.items.length > 0)
    .map((group) => (
      <div key={group.key} className="mb-6">
        <div
          className="flex items-baseline gap-2"
          style={{
            paddingBottom: "8px",
            borderBottom: "1px solid #ead1d1",
          }}
        >
          <h3
            className="font-bold"
            style={{ fontSize: "17px", color: "#611a1a" }}
          >
            {group.name}
          </h3>

          <span className="text-sm text-gray-500">
            {uslugaLabel(group.items.length)}
          </span>
        </div>

        {group.key === "none" && (
          <p
            className="text-sm"
            style={{ marginTop: "8px", color: "#b45309" }}
          >
            Ove usluge se ne prikazuju klijentima. Kliknite „Uredi“ i
            izaberite kategoriju.
          </p>
        )}

        <div
          style={{
            marginTop: "12px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "10px" : "14px",
          }}
        >
          {group.items.map((service) => {
            const isEditing = editingServiceId === service.id;

            const staffNames = (service.service_barbers || [])
              .map(
                (serviceBarber: any) =>
                  barbers.find(
                    (barber) => barber.id === serviceBarber.barber_id
                  )?.name
              )
              .filter(Boolean);

            const priceAndDuration = [
              service.duration_minutes
                ? `${service.duration_minutes} min`
                : null,
              service.price ? `${service.price} KM` : null,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <div
                key={service.id}
                className="flex flex-col rounded-2xl border shadow-sm"
                style={{
                  padding: "14px 16px",
                  gap: "6px",
                  backgroundColor: isEditing ? "#f5e6e6" : "#ffffff",
                  borderColor: isEditing ? "#611a1a" : "#ead1d1",
                  borderWidth: isEditing ? "2px" : "1px",
                }}
              >
                <p
                  className="font-bold"
                  style={{ fontSize: "16px", lineHeight: 1.3 }}
                >
                  {service.name}
                </p>

                {service.description && (
                  <p
                    className="text-sm text-gray-500"
                    style={{ lineHeight: 1.4 }}
                  >
                    {service.description}
                  </p>
                )}

                {priceAndDuration && (
                  <p
                    className="font-semibold"
                    style={{ fontSize: "15px", color: "#111827" }}
                  >
                    {priceAndDuration}
                  </p>
                )}

                <p className="text-sm text-gray-600">
                  {staffNames.length > 0
                    ? staffNames.join(", ")
                    : "Svo osoblje"}
                </p>

                {(!service.show_price || !service.show_duration) && (
                  <div className="flex flex-wrap gap-1.5">
                    {!service.show_price && (
                      <span
                        className="rounded-full text-xs text-gray-600"
                        style={{
                          padding: "3px 8px",
                          backgroundColor: "#f3f4f6",
                        }}
                      >
                        Cijena skrivena
                      </span>
                    )}

                    {!service.show_duration && (
                      <span
                        className="rounded-full text-xs text-gray-600"
                        style={{
                          padding: "3px 8px",
                          backgroundColor: "#f3f4f6",
                        }}
                      >
                        Trajanje skriveno
                      </span>
                    )}
                  </div>
                )}

                <div
                  className="flex gap-2"
                  style={{
                    marginTop: "auto",
                    paddingTop: "6px",
                    justifyContent: isMobile ? undefined : "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleEditService(service)}
                    className="rounded-xl border bg-white font-semibold transition hover:opacity-90"
                    style={{
                      height: "40px",
                      flex: isMobile ? 1 : undefined,
                      padding: isMobile ? undefined : "0 20px",
                      fontSize: "14px",
                      color: "#611a1a",
                      borderColor: "#611a1a",
                    }}
                  >
                    Uredi
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteService(service.id)}
                    className="rounded-xl border bg-white font-semibold transition hover:opacity-90"
                    style={{
                      height: "40px",
                      flex: isMobile ? 1 : undefined,
                      padding: isMobile ? undefined : "0 20px",
                      fontSize: "14px",
                      color: "#ef4444",
                      borderColor: "#ef4444",
                    }}
                  >
                    Obriši
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ))}


    </div>
  </div>
)}
{selectedSettings.includes("times") && (
  <div className="mb-6">
    <h2 className="font-bold" style={{ fontSize: isMobile ? "24px" : "30px" }}>
      Slobodni termini
    </h2>

    <p className="text-gray-500" style={{ marginTop: "4px", fontSize: "15px", lineHeight: 1.4 }}>
      Ovdje određujete u koje vrijeme klijenti mogu rezervisati.
    </p>

    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        marginTop: "16px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        borderColor: "#d1d5db",
        maxWidth: isMobile ? undefined : "560px",
      }}
    >
      {[
        { key: "week" as const, title: "📅 Raspored po sedmici", text: "Za više sedmica odjednom" },
        { key: "day" as const, title: "✏️ Jedan dan", text: "Izuzeci i pojedinačni termini" },
      ].map((tab) => {
        const isActive = timesTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setTimesTab(tab.key)}
            className="flex flex-col items-center justify-center text-center"
            style={{
              padding: "10px 6px",
              backgroundColor: isActive ? "#611a1a" : "#ffffff",
              color: isActive ? "#ffffff" : "#374151",
            }}
          >
            <span className="font-semibold" style={{ fontSize: "15px" }}>
              {tab.title}
            </span>

            <span
              style={{
                marginTop: "2px",
                fontSize: "12px",
                color: isActive ? "#f3dede" : "#6b7280",
              }}
            >
              {tab.text}
            </span>
          </button>
        );
      })}
    </div>

    {timesTab === "week" && (
      <div
        className="rounded-2xl border bg-white shadow-sm"
        style={{
          marginTop: "16px",
          padding: isMobile ? "4px 16px 16px" : "8px 26px 22px",
          borderColor: "#ead1d1",
          maxWidth: "880px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            columnGap: "32px",
          }}
        >

        <div
          className="flex"
          style={{ gap: "12px", padding: "14px 0", borderBottom: "1px solid #f1e4e4" }}
        >
          <div
            className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
            style={{ width: "28px", height: "28px", fontSize: "14px", backgroundColor: "#611a1a" }}
          >
            1
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="font-bold" style={{ fontSize: "16px" }}>
              Za koga?
            </p>
            <p className="text-gray-500" style={{ fontSize: "13px", marginTop: "2px" }}>
              Izaberite jednog ili više članova osoblja.
            </p>

            <div className="flex flex-wrap gap-2" style={{ marginTop: "10px" }}>
              {(() => {
                const allSelected =
                  barbers.length > 0 &&
                  barbers.every((barber) =>
                    selectedScheduleBarberIds.includes(barber.id)
                  );

                return (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedScheduleBarberIds(
                        allSelected ? [] : barbers.map((barber) => barber.id)
                      )
                    }
                    className="rounded-full border transition"
                style={{
                  height: "40px",
                  padding: "0 14px",
                  fontSize: "15px",
                  fontWeight: allSelected ? 600 : 400,
                  backgroundColor: allSelected ? "#611a1a" : "#ffffff",
                  borderColor: allSelected ? "#611a1a" : "#d1d5db",
                  color: allSelected ? "#ffffff" : "#111827",
                }}
                  >
                    {allSelected ? "✓ " : ""}Svi
                  </button>
                );
              })()}

              {barbers.map((barber) => {
                const isSelected = selectedScheduleBarberIds.includes(barber.id);

                return (
                  <button
                    key={barber.id}
                    type="button"
                    onClick={() => {
                      if (!isSelected) {
                        setSelectedScheduleBarberIds((prev) => [
                          ...prev,
                          barber.id,
                        ]);
                      } else {
                        setSelectedScheduleBarberIds((prev) =>
                          prev.filter((id) => id !== barber.id)
                        );
                      }
                    }}
                    className="rounded-full border transition"
                style={{
                  height: "40px",
                  padding: "0 14px",
                  fontSize: "15px",
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected ? "#611a1a" : "#ffffff",
                  borderColor: isSelected ? "#611a1a" : "#d1d5db",
                  color: isSelected ? "#ffffff" : "#111827",
                }}
                  >
                    {isSelected ? "✓ " : ""}
                    {barber.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className="flex"
          style={{ gap: "12px", padding: "14px 0", borderBottom: "1px solid #f1e4e4" }}
        >
          <div
            className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
            style={{ width: "28px", height: "28px", fontSize: "14px", backgroundColor: "#611a1a" }}
          >
            2
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="font-bold" style={{ fontSize: "16px" }}>
              Za koji period?
            </p>

            <div
              style={{
                marginTop: "10px",
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "10px",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">
                  Od datuma
                </label>

    <DatePicker
  ref={scheduleStartDatePickerRef}
  selected={
    scheduleStartDate
      ? new Date(`${scheduleStartDate}T00:00:00`)
      : null
  }
  onChange={(date: Date | null) => {
    setScheduleStartDate(date ? format(date, "yyyy-MM-dd") : "");
  }}
  locale="bs"
dateFormat="dd.MM.yyyy"
placeholderText={isMobile ? "Odaberite" : "Odaberite datum"}
popperPlacement={isMobile ? "bottom-start" : undefined}
popperClassName={isMobile ? "mobile-datepicker-popper" : undefined}
formatWeekDay={(dayName) => {
    const days: Record<string, string> = {
      nedjelja: "ned",
      ponedjeljak: "pon",
      utorak: "uto",
      srijeda: "sri",
      sreda: "sri",
      četvrtak: "čet",
      petak: "pet",
      subota: "sub",
    };

    return days[dayName.toLowerCase()] ?? dayName.slice(0, 3);
  }}
  calendarContainer={({ className, children }) => (
    <CalendarContainer className={className}>
      {children}

      <div
        style={{
          padding: "8px",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setScheduleStartDate("");
            scheduleStartDatePickerRef.current?.setOpen(false);
          }}
          style={{
            color: "#611a1a",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Poništi
        </button>
      </div>
    </CalendarContainer>
  )}
  className="w-full rounded-xl border border-gray-300 bg-white p-3"
/>

              </div>

              <div style={{ minWidth: 0 }}>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">
                  Do datuma
                </label>

    <DatePicker
  ref={scheduleEndDatePickerRef}
  selected={
    scheduleEndDate
      ? new Date(`${scheduleEndDate}T00:00:00`)
      : null
  }
  onChange={(date: Date | null) => {
    setScheduleEndDate(date ? format(date, "yyyy-MM-dd") : "");
  }}
locale="bs"
dateFormat="dd.MM.yyyy"
placeholderText={isMobile ? "Odaberite" : "Odaberite datum"}
popperPlacement={isMobile ? "bottom-start" : undefined}
popperClassName={isMobile ? "mobile-datepicker-popper-end" : undefined}
formatWeekDay={(dayName) => {
    const days: Record<string, string> = {
      nedjelja: "ned",
      ponedjeljak: "pon",
      utorak: "uto",
      srijeda: "sri",
      sreda: "sri",
      četvrtak: "čet",
      petak: "pet",
      subota: "sub",
    };

    return days[dayName.toLowerCase()] ?? dayName.slice(0, 3);
  }}
  calendarContainer={({ className, children }) => (
    <CalendarContainer className={className}>
      {children}

      <div
        style={{
          padding: "8px",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setScheduleEndDate("");
            scheduleEndDatePickerRef.current?.setOpen(false);
          }}
          style={{
            color: "#611a1a",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Poništi
        </button>
      </div>
    </CalendarContainer>
  )}
  
  className="w-full rounded-xl border border-gray-300 bg-white p-3"
/>

              </div>
            </div>
          </div>
        </div>

        <div
          className="flex"
          style={{ gap: "12px", padding: "14px 0", borderBottom: "1px solid #f1e4e4" }}
        >
          <div
            className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
            style={{ width: "28px", height: "28px", fontSize: "14px", backgroundColor: "#611a1a" }}
          >
            3
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="font-bold" style={{ fontSize: "16px" }}>
              Koje dane u sedmici?
            </p>

            <div className="flex flex-wrap gap-2" style={{ marginTop: "10px" }}>
              {["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"].map((day) => {
                const isSelected = selectedDays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedDays((currentDays) =>
                        currentDays.includes(day)
                          ? currentDays.filter((selectedDay) => selectedDay !== day)
                          : [...currentDays, day]
                      );
                    }}
                    className="rounded-full border transition"
                style={{
                  height: "40px",
                  padding: "0 14px",
                  fontSize: "15px",
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected ? "#611a1a" : "#ffffff",
                  borderColor: isSelected ? "#611a1a" : "#d1d5db",
                  color: isSelected ? "#ffffff" : "#111827",
                  minWidth: "54px",
                }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className="flex"
          style={{ gap: "12px", padding: "14px 0", borderBottom: "1px solid #f1e4e4" }}
        >
          <div
            className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
            style={{ width: "28px", height: "28px", fontSize: "14px", backgroundColor: "#611a1a" }}
          >
            4
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="font-bold" style={{ fontSize: "16px" }}>
              U koje vrijeme?
            </p>

            <div
              style={{
                marginTop: "10px",
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "10px",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">
                  Od
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-white text-left [&::-webkit-date-and-time-value]:m-0 [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:leading-[44px]"
                  style={{
                    height: "46px",
                    lineHeight: "44px",
                    padding: "0 10px",
                    fontSize: "16px",
                    minWidth: 0,
                    maxWidth: "100%",
                    WebkitAppearance: "none",
                    appearance: "none",
                  }}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">
                  Do
                </label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-white text-left [&::-webkit-date-and-time-value]:m-0 [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:leading-[44px]"
                  style={{
                    height: "46px",
                    lineHeight: "44px",
                    padding: "0 10px",
                    fontSize: "16px",
                    minWidth: 0,
                    maxWidth: "100%",
                    WebkitAppearance: "none",
                    appearance: "none",
                  }}
                />
              </div>
            </div>

            <label className="mb-1.5 block text-sm font-bold text-gray-700" style={{ marginTop: "12px" }}>
              Novi termin svakih
            </label>

            <div className="flex flex-wrap gap-2">
              {["15", "30", "45", "60"].map((minutes) => {
                const isSelected = intervalMinutes === minutes;

                return (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setIntervalMinutes(minutes)}
                    className="rounded-full border transition"
                style={{
                  height: "40px",
                  padding: "0 14px",
                  fontSize: "15px",
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected ? "#611a1a" : "#ffffff",
                  borderColor: isSelected ? "#611a1a" : "#d1d5db",
                  color: isSelected ? "#ffffff" : "#111827",
                }}
                  >
                    {minutes} min
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        </div>

        <div
          className="flex"
          style={{ gap: "12px", padding: "14px 0", borderBottom: "1px solid #f1e4e4" }}
        >
          <div
            className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
            style={{ width: "28px", height: "28px", fontSize: "14px", backgroundColor: "#611a1a" }}
          >
            5
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="font-bold" style={{ fontSize: "16px" }}>
              Pregledajte termine
            </p>
            <p className="text-gray-500" style={{ fontSize: "13px", marginTop: "2px" }}>
              Termini se ne čuvaju dok ne kliknete „Sačuvaj termine“.
            </p>

            <button
              type="button"
              onClick={handleGenerateTimes}
              className="rounded-xl border font-semibold transition hover:bg-gray-50"
              style={{
                marginTop: "10px",
                height: "46px",
                padding: "0 20px",
                fontSize: "15px",
                color: "#611a1a",
                borderColor: "#611a1a",
                backgroundColor: "#ffffff",
              }}
            >
              {generatedTimes.length > 0 ? "Osvježi pregled" : "Prikaži pregled"}
            </button>
          </div>
        </div>

        {generatedTimes.length > 0 && (() => {
          const groupedTimes = Object.entries(
            generatedTimes.reduce((grouped: Record<string, string[]>, slot) => {
              if (!grouped[slot.date]) {
                grouped[slot.date] = [];
              }

              grouped[slot.date].push(slot.time);
              return grouped;
            }, {})
          );

          const staffNames = barbers
            .filter((barber) => selectedScheduleBarberIds.includes(barber.id))
            .map((barber) => barber.name);

          const firstDate = groupedTimes[0][0];
          const lastDate = groupedTimes[groupedTimes.length - 1][0];

          return (
            <>
              <div
                className="rounded-2xl"
                style={{ marginTop: "16px", padding: "14px", backgroundColor: "#faf7f7" }}
              >
                <p className="font-bold" style={{ fontSize: "15px", color: "#611a1a" }}>
                  Pregled
                </p>

                <p style={{ fontSize: "14px", marginTop: "6px", lineHeight: 1.5 }}>
                  <b>{staffNames.join(", ")}</b> ·{" "}
                  {format(new Date(`${firstDate}T00:00:00`), "dd.MM.yyyy")}–
                  {format(new Date(`${lastDate}T00:00:00`), "dd.MM.yyyy")}
                </p>

                <p style={{ fontSize: "14px", marginTop: "6px" }}>
                  <span className="font-bold" style={{ fontSize: "22px", color: "#611a1a" }}>
                    {groupedTimes.length} {groupedTimes.length === 1 ? "dan" : "dana"}
                  </span>
                  {" "}· {(groupedTimes[0][1] as string[]).length} termina po danu
                </p>

                {groupedTimes
                  .slice(0, showPreview ? 5 : 1)
                  .map(([date, dayTimes]) => (
                    <div key={date} style={{ marginTop: "10px" }}>
                      <p className="font-bold" style={{ fontSize: "13px" }}>
                        {format(new Date(`${date}T00:00:00`), "dd.MM.yyyy")}
                      </p>

                      <div className="flex flex-wrap" style={{ gap: "6px", marginTop: "6px" }}>
                        {(dayTimes as string[]).map((time) => (
                          <span
                            key={`${date}-${time}`}
                            className="rounded-lg border bg-white"
                            style={{ fontSize: "13px", padding: "4px 8px", borderColor: "#ead1d1" }}
                          >
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                {groupedTimes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="font-semibold"
                    style={{ marginTop: "10px", fontSize: "13px", color: "#611a1a" }}
                  >
                    {showPreview ? "Prikaži manje" : "Prikaži još dana ›"}
                  </button>
                )}
              </div>

              <div
                className="rounded-xl border"
                style={{
                  marginTop: "14px",
                  padding: "12px",
                  fontSize: "14px",
                  lineHeight: 1.45,
                  borderColor: "#f3c7a6",
                  backgroundColor: "#fff7ed",
                  color: "#9a3412",
                }}
              >
                ⚠ Ako {staffNames.join(", ")} već {staffNames.length === 1 ? "ima" : "imaju"} termine
                u ovim danima, oni će biti <b>zamijenjeni</b> novim terminima.
              </div>
            </>
          );
        })()}

        <button
          type="button"
          onClick={handleReplaceTimes}
          disabled={generatedTimes.length === 0}
          className="rounded-xl font-bold text-white"
          style={{
            marginTop: "14px",
            height: "52px",
            width: isMobile ? "100%" : undefined,
            padding: isMobile ? undefined : "0 30px",
            fontSize: "16px",
            backgroundColor: "#611a1a",
            cursor: generatedTimes.length === 0 ? "not-allowed" : "pointer",
            opacity: generatedTimes.length === 0 ? 0.5 : 1,
          }}
        >
          {timesSaved ? "Sačuvano ✓" : "Sačuvaj termine"}
        </button>
      </div>
    )}

    {timesTab === "day" && (
      <div
        className="rounded-2xl border bg-white shadow-sm"
        style={{
          marginTop: "16px",
          padding: isMobile ? "16px" : "22px 26px",
          borderColor: "#ead1d1",
          maxWidth: "880px",
        }}
      >
        <div style={{ maxWidth: isMobile ? undefined : "260px" }}>
          <label className="mb-1.5 block text-sm font-bold text-gray-700">
            Datum
          </label>

<DatePicker
  ref={datePickerRef}
  selected={selectedDate ? new Date(`${selectedDate}T00:00:00`) : null}
  onChange={(date: Date | null) => {
    setSelectedDate(date ? format(date, "yyyy-MM-dd") : "");
  }}
  locale="bs"
  dateFormat="dd.MM.yyyy"
 placeholderText="Odaberite datum"
popperPlacement={isMobile ? "bottom-start" : undefined}
popperClassName={isMobile ? "mobile-datepicker-popper" : undefined}
formatWeekDay={(dayName) => {
    const days: Record<string, string> = {
      nedjelja: "ned",
      ponedjeljak: "pon",
      utorak: "uto",
      srijeda: "sri",
      sreda: "sri",
      četvrtak: "čet",
      petak: "pet",
      subota: "sub",
    };

    return days[dayName.toLowerCase()] ?? dayName.slice(0, 3);
  }}
  
  calendarContainer={({ className, children }) => (
    <CalendarContainer className={className}>
      {children}

      <div
        style={{
          padding: "8px",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          onClick={() => {
  setSelectedDate("");
  datePickerRef.current?.setOpen(false);
}}
          style={{
            color: "#611a1a",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Poništi
        </button>
      </div>
    </CalendarContainer>
  )}
  className="w-full rounded-xl border border-gray-300 bg-white p-3"
/>

        </div>

        <label className="mb-1.5 block text-sm font-bold text-gray-700" style={{ marginTop: "14px" }}>
          Za koga?
        </label>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "all" as const, name: "Cijeli salon" },
            ...barbers.map((barber) => ({ id: barber.id as number, name: barber.name })),
          ].map((option) => {
            const isSelected = manualTimeBarberId === option.id;

            return (
              <button
                key={String(option.id)}
                type="button"
                onClick={() => setManualTimeBarberId(option.id)}
                className="rounded-full border transition"
                style={{
                  height: "40px",
                  padding: "0 14px",
                  fontSize: "15px",
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected ? "#611a1a" : "#ffffff",
                  borderColor: isSelected ? "#611a1a" : "#d1d5db",
                  color: isSelected ? "#ffffff" : "#111827",
                }}
              >
                {option.name}
              </button>
            );
          })}
        </div>

        {!selectedDate && (
          <p className="text-gray-500" style={{ marginTop: "16px", fontSize: "15px" }}>
            Izaberite datum da vidite termine za taj dan.
          </p>
        )}

        {selectedDate && (() => {
          const dayTimes = times.filter(
            (item, index, array) =>
              manualTimeBarberId !== "all" ||
              index === array.findIndex((other) => other.time === item.time)
          );

          const dayTitle = format(
            new Date(`${selectedDate}T00:00:00`),
            "EEEE, dd.MM.yyyy",
            { locale: bs }
          );

          return (
            <>
              <p className="font-bold" style={{ marginTop: "16px", fontSize: "18px" }}>
                {dayTitle.charAt(0).toUpperCase() + dayTitle.slice(1)}
              </p>

              {dayTimes.length === 0 ? (
                <div
                  className="rounded-xl bg-gray-100 text-center text-gray-500"
                  style={{ marginTop: "10px", padding: "16px" }}
                >
                  Nema termina za odabrani datum.
                </div>
              ) : (
                <>
                  <p className="text-gray-500" style={{ fontSize: "14px", marginTop: "2px" }}>
                    {dayTimes.length} termina · kliknite ✕ da uklonite termin
                  </p>

                  <div
                    style={{
                      marginTop: "12px",
                      display: "grid",
                      gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)",
                      gap: "8px",
                    }}
                  >
                    {dayTimes.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border bg-white"
                        style={{
                          height: "46px",
                          padding: "0 8px 0 12px",
                          borderColor: "#ead1d1",
                          fontSize: "16px",
                          fontWeight: 600,
                        }}
                      >
                        <span>{item.time}</span>

                        <button
                          type="button"
                          onClick={() => handleDeleteTime(item.id)}
                          aria-label={`Obriši termin ${item.time}`}
                          className="flex items-center justify-center rounded-full"
                          style={{
                            width: "28px",
                            height: "28px",
                            fontSize: "16px",
                            color: "#ef4444",
                            backgroundColor: "#fef2f2",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <label className="mb-1.5 block text-sm font-bold text-gray-700" style={{ marginTop: "18px" }}>
                Dodaj termin
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "8px",
                  maxWidth: isMobile ? undefined : "380px",
                }}
              >
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.currentTarget.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-white text-left [&::-webkit-date-and-time-value]:m-0 [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:leading-[44px]"
                  style={{
                    height: "46px",
                    lineHeight: "44px",
                    padding: "0 10px",
                    fontSize: "16px",
                    minWidth: 0,
                    maxWidth: "100%",
                    WebkitAppearance: "none",
                    appearance: "none",
                  }}
                />

                <button
                  type="button"
                  onClick={handleAddTime}
                  className="rounded-xl font-bold text-white"
                  style={{
                    height: "46px",
                    padding: "0 18px",
                    fontSize: "15px",
                    backgroundColor: "#611a1a",
                    whiteSpace: "nowrap",
                  }}
                >
                  + Dodaj
                </button>
              </div>

              {dayTimes.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteAllTimesForDate}
                  className="font-semibold"
                  style={{ marginTop: "18px", fontSize: "15px", color: "#ef4444" }}
                >
                  Obriši sve termine za ovaj dan
                </button>
              )}
            </>
          );
        })()}
      </div>
    )}
  </div>
)}

{selectedSettings.includes("closed") && (() => {
  const monthShort = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  const todayString = format(new Date(), "yyyy-MM-dd");

  const nextDayString = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00`);
    date.setDate(date.getDate() + 1);
    return format(date, "yyyy-MM-dd");
  };

  // Dagar i rad med samma person och anledning visas som en period.
  const closedGroups: {
    ids: number[];
    start: string;
    end: string;
    reason: string;
    barberId: number | null;
  }[] = [];

  [...closedDays]
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .forEach((day) => {
      const barberId = day.barber_id ?? null;
      const reason = day.reason || "";

      const openGroup = closedGroups.find(
        (group) =>
          group.barberId === barberId &&
          group.reason === reason &&
          nextDayString(group.end) === day.date
      );

      if (openGroup) {
        openGroup.ids.push(day.id);
        openGroup.end = day.date;
      } else {
        closedGroups.push({
          ids: [day.id],
          start: day.date,
          end: day.date,
          reason,
          barberId,
        });
      }
    });

  closedGroups.sort((a, b) => a.start.localeCompare(b.start));

  const upcomingGroups = closedGroups.filter((group) => group.end >= todayString);
  const pastGroups = closedGroups.filter((group) => group.end < todayString);

  const renderClosedGroup = (group: (typeof closedGroups)[number]) => {
    const startDate = new Date(`${group.start}T00:00:00`);
    const endDate = new Date(`${group.end}T00:00:00`);
    const dayCount = group.ids.length;
    const weekday = format(startDate, "EEEE", { locale: bs });
    const barberName = group.barberId
      ? barbers.find((barber) => barber.id === group.barberId)?.name || "Član osoblja"
      : null;

    const title =
      group.start === group.end
        ? `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${format(startDate, "dd.MM.yyyy")}`
        : startDate.getFullYear() === endDate.getFullYear()
        ? `${format(startDate, "dd.MM.")} – ${format(endDate, "dd.MM.yyyy")}`
        : `${format(startDate, "dd.MM.yyyy")} – ${format(endDate, "dd.MM.yyyy")}`;

    return (
      <div
        key={group.ids[0]}
        className="flex items-start"
        style={{ gap: "12px", padding: "14px 0", borderTop: "1px solid #f3e8e8" }}
      >
        <div
          className="shrink-0 overflow-hidden rounded-xl border text-center"
          style={{ width: "52px", borderColor: "#ead1d1" }}
        >
          <div
            className="font-bold uppercase text-white"
            style={{ fontSize: "11px", padding: "3px 0", backgroundColor: "#611a1a" }}
          >
            {monthShort[startDate.getMonth()]}
          </div>

          <div className="font-bold" style={{ fontSize: "20px", padding: "4px 0" }}>
            {startDate.getDate()}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="font-bold" style={{ fontSize: "16px" }}>
            {title}
          </p>

          <p className="text-gray-600" style={{ fontSize: "14px", marginTop: "3px" }}>
            {group.reason || "Bez razloga"}
            {dayCount > 1 ? ` · ${dayCount} dana` : ""}
          </p>

          <span
            className="inline-block rounded-full"
            style={{
              marginTop: "6px",
              fontSize: "12px",
              padding: "3px 9px",
              backgroundColor: barberName ? "#f3f4f6" : "#fdf2f2",
              color: barberName ? "#374151" : "#611a1a",
            }}
          >
            {barberName ? `👤 ${barberName}` : "🏠 Cijeli salon"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleDeleteClosedDayGroup(group.ids)}
          className="shrink-0 rounded-xl border bg-white font-semibold"
          style={{
            height: "36px",
            padding: "0 14px",
            fontSize: "14px",
            color: "#ef4444",
            borderColor: "#ef4444",
          }}
        >
          Obriši
        </button>
      </div>
    );
  };

  const selectedDayCount =
    closedDate && closedEndDate && closedEndDate >= closedDate
      ? Math.round(
          (new Date(`${closedEndDate}T00:00:00`).getTime() -
            new Date(`${closedDate}T00:00:00`).getTime()) /
            86400000
        ) + 1
      : 0;

  const selectedBarberName = closedBarberId
    ? barbers.find((barber) => barber.id === closedBarberId)?.name
    : null;

  return (
  <div className="mb-6">
    <h2 className="font-bold" style={{ fontSize: isMobile ? "24px" : "30px" }}>
      Zatvoreni dani
    </h2>

    <p className="text-gray-500" style={{ marginTop: "4px", fontSize: "15px", lineHeight: 1.4 }}>
      Dani kada klijenti ne mogu rezervisati – za cijeli salon ili za jednog člana osoblja.
    </p>

    <div
      style={{
        marginTop: "16px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? "16px" : "24px",
        alignItems: "start",
      }}
    >
      <div
        className="rounded-2xl border-2 bg-white"
        style={{ padding: isMobile ? "16px" : "22px 24px", borderColor: "#611a1a" }}
      >
        <p className="font-bold" style={{ fontSize: "19px", color: "#611a1a" }}>
          Dodaj zatvorene dane
        </p>

        <label className="mb-1.5 block text-sm font-bold text-gray-700" style={{ marginTop: "14px" }}>
          Za koga?
        </label>

        <div className="flex flex-wrap gap-2">
          {[
            { id: null as number | null, name: "Cijeli salon" },
            ...barbers.map((barber) => ({ id: barber.id as number | null, name: barber.name })),
          ].map((option) => {
            const isSelected = closedBarberId === option.id;

            return (
              <button
                key={String(option.id)}
                type="button"
                onClick={() => setClosedBarberId(option.id)}
                className="rounded-full border transition"
                style={{
                  height: "40px",
                  padding: "0 14px",
                  fontSize: "15px",
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected ? "#611a1a" : "#ffffff",
                  borderColor: isSelected ? "#611a1a" : "#d1d5db",
                  color: isSelected ? "#ffffff" : "#111827",
                }}
              >
                {option.name}
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "14px",
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "10px",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
              Od datuma
            </label>

<DatePicker
  ref={closedDatePickerRef}
  selected={
    closedDate
      ? new Date(`${closedDate}T00:00:00`)
      : null
  }
  onChange={(date: Date | null) => {
    setClosedDate(date ? format(date, "yyyy-MM-dd") : "");
  }}
  locale="bs"
dateFormat="dd.MM.yyyy"
placeholderText={isMobile ? "Odaberite" : "Odaberite datum"}
popperPlacement={isMobile ? "bottom-start" : undefined}
popperClassName={isMobile ? "mobile-datepicker-popper" : undefined}
formatWeekDay={(dayName) => {
    const days: Record<string, string> = {
      nedjelja: "ned",
      ponedjeljak: "pon",
      utorak: "uto",
      srijeda: "sri",
      sreda: "sri",
      četvrtak: "čet",
      petak: "pet",
      subota: "sub",
    };

    return days[dayName.toLowerCase()] ?? dayName.slice(0, 3);
  }}
  calendarContainer={({ className, children }) => (
    <CalendarContainer className={className}>
      {children}

      <div
        style={{
          padding: "8px",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setClosedDate("");
            closedDatePickerRef.current?.setOpen(false);
          }}
          style={{
            color: "#611a1a",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Poništi
        </button>
      </div>
    </CalendarContainer>
  )}
  className="w-full rounded-xl border border-gray-300 bg-white p-3"
  wrapperClassName="block w-full"
/>

          </div>

          <div style={{ minWidth: 0 }}>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
              Do datuma
            </label>

<DatePicker
  ref={closedEndDatePickerRef}
  selected={
    closedEndDate
      ? new Date(`${closedEndDate}T00:00:00`)
      : null
  }
  onChange={(date: Date | null) => {
    setClosedEndDate(date ? format(date, "yyyy-MM-dd") : "");
  }}
  locale="bs"
 dateFormat="dd.MM.yyyy"
placeholderText={isMobile ? "Odaberite" : "Odaberite datum"}
popperPlacement={isMobile ? "bottom-start" : undefined}
popperClassName={isMobile ? "mobile-datepicker-popper" : undefined}
formatWeekDay={(dayName) => {
    const days: Record<string, string> = {
      nedjelja: "ned",
      ponedjeljak: "pon",
      utorak: "uto",
      srijeda: "sri",
      sreda: "sri",
      četvrtak: "čet",
      petak: "pet",
      subota: "sub",
    };

    return days[dayName.toLowerCase()] ?? dayName.slice(0, 3);
  }}
  calendarContainer={({ className, children }) => (
    <CalendarContainer className={className}>
      {children}

      <div
        style={{
          padding: "8px",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setClosedEndDate("");
            closedEndDatePickerRef.current?.setOpen(false);
          }}
          style={{
            color: "#611a1a",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Poništi
        </button>
      </div>
    </CalendarContainer>
  )}
  className="w-full rounded-xl border border-gray-300 bg-white p-3"
  wrapperClassName="block w-full"
/>

          </div>
        </div>

        <p className="text-gray-500" style={{ marginTop: "6px", fontSize: "13px" }}>
          Za samo jedan dan izaberite isti datum u oba polja.
        </p>

        <label className="mb-1.5 block text-sm font-bold text-gray-700" style={{ marginTop: "14px" }}>
          Razlog{" "}
          <span className="font-normal text-gray-500" style={{ fontSize: "12px" }}>
            (nije obavezno)
          </span>
        </label>

        <div className="flex flex-wrap gap-2">
          {["Godišnji odmor", "Praznik", "Bolovanje", "Edukacija"].map((reason) => {
            const isSelected = closedReason === reason;

            return (
              <button
                key={reason}
                type="button"
                onClick={() => setClosedReason(isSelected ? "" : reason)}
                className="rounded-full border transition"
                style={{
                  height: "36px",
                  padding: "0 14px",
                  fontSize: "14px",
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected ? "#611a1a" : "#ffffff",
                  borderColor: isSelected ? "#611a1a" : "#d1d5db",
                  color: isSelected ? "#ffffff" : "#111827",
                }}
              >
                {reason}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          placeholder="ili upišite svoj razlog"
          value={closedReason}
          onChange={(e) => setClosedReason(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-3 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
          style={{ marginTop: "8px", height: "46px", fontSize: "16px" }}
        />

        {selectedDayCount > 0 && (
          <div
            className="rounded-xl"
            style={{
              marginTop: "16px",
              padding: "12px 14px",
              fontSize: "15px",
              lineHeight: 1.45,
              backgroundColor: "#faf7f7",
            }}
          >
            {selectedBarberName ? `${selectedBarberName} neće raditi ` : "Salon će biti zatvoren "}
            <b style={{ color: "#611a1a" }}>
              {selectedDayCount === 1 ? "1 dan" : `${selectedDayCount} dana`}
            </b>{" "}
            ({selectedDayCount === 1
              ? format(new Date(`${closedDate}T00:00:00`), "dd.MM.yyyy")
              : `${format(new Date(`${closedDate}T00:00:00`), "dd.MM.")} – ${format(new Date(`${closedEndDate}T00:00:00`), "dd.MM.yyyy")}`}
            ). Klijenti neće moći rezervisati
            {selectedBarberName ? " kod ovog člana osoblja" : ""} u tim danima.
          </div>
        )}

        <button
          type="button"
          onClick={handleAddClosedDay}
          className="rounded-xl font-bold text-white transition hover:opacity-90"
          style={{
            marginTop: "14px",
            height: "52px",
            width: isMobile ? "100%" : undefined,
            padding: isMobile ? undefined : "0 28px",
            fontSize: "16px",
            backgroundColor: "#611a1a",
          }}
        >
          Sačuvaj zatvorene dane
        </button>
      </div>

      <div
        className="rounded-2xl border bg-white shadow-sm"
        style={{ padding: isMobile ? "16px" : "22px 24px", borderColor: "#ead1d1" }}
      >
        <div className="flex items-baseline gap-2" style={{ paddingBottom: "8px" }}>
          <p className="font-bold" style={{ fontSize: "17px", color: "#611a1a" }}>
            Zakazani zatvoreni dani
          </p>

          <span className="text-sm text-gray-500">{upcomingGroups.length}</span>
        </div>

        {upcomingGroups.length === 0 ? (
          <p
            className="text-gray-500"
            style={{ padding: "14px 0", fontSize: "15px", borderTop: "1px solid #f3e8e8" }}
          >
            Nema zakazanih zatvorenih dana. Salon radi po redovnom rasporedu.
          </p>
        ) : (
          upcomingGroups.map(renderClosedGroup)
        )}

        {pastGroups.length > 0 && (
          <details style={{ marginTop: "6px" }}>
            <summary
              className="cursor-pointer font-semibold"
              style={{ fontSize: "14px", color: "#611a1a" }}
            >
              Prikaži prošle dane ({pastGroups.length})
            </summary>

            <div style={{ opacity: 0.7 }}>{pastGroups.map(renderClosedGroup)}</div>
          </details>
        )}
      </div>
    </div>
  </div>
  );
})()}

{selectedSettings.includes("barbers") && (() => {
  const colorNames = [
    "Plava",
    "Žuta",
    "Zelena",
    "Ljubičasta",
    "Narandžasta",
    "Tirkizna",
    "Roza",
    "Indigo",
    "Svijetlozelena",
    "Crvena",
  ];

  const colorIndexFor = (barber: any) =>
    barber.color_index !== null && barber.color_index !== undefined
      ? Number(barber.color_index) % barberColors.length
      : Math.abs(Number(barber.id)) % barberColors.length;

  // Sparar direkt när strömbrytaren trycks (samma anrop som förut).
  const handleToggleShowBarbers = async () => {
    const newValue = !showBarbers;
    setShowBarbers(newValue);

    const { error } = await supabase
      .from("salons")
      .update({
        show_barbers: newValue,
      })
      .eq("id", salon?.id);

    if (error) {
      setShowBarbers(!newValue);
      showNotice("Greška pri spremanju postavke.");
      console.error(error);
      return;
    }

    showNotice(
      newValue
        ? "Klijenti sada biraju člana osoblja."
        : "Osoblje se više ne prikazuje klijentima.",
      "success"
    );
  };

  return (
  <div className="mb-6">
    <h2 className="font-bold" style={{ fontSize: isMobile ? "24px" : "30px" }}>
      Osoblje
    </h2>

    <p className="text-gray-500" style={{ marginTop: "4px", fontSize: "15px", lineHeight: 1.4 }}>
      Ko radi u salonu. Svaki član osoblja ima svoju boju u kalendaru.
    </p>

    <div
      style={{
        marginTop: "16px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? "16px" : "24px",
        alignItems: "start",
      }}
    >
      <div
        className="rounded-2xl border bg-white shadow-sm"
        style={{ padding: isMobile ? "16px" : "22px 24px", borderColor: "#ead1d1" }}
      >
        <div className="flex items-baseline gap-2" style={{ paddingBottom: "10px" }}>
          <p className="font-bold" style={{ fontSize: "17px", color: "#611a1a" }}>
            Članovi osoblja
          </p>

          <span className="text-sm text-gray-500">{barbers.length}</span>
        </div>

        {barbers.length === 0 && (
          <p
            className="text-gray-500"
            style={{ padding: "12px 0", fontSize: "15px", borderTop: "1px solid #f3e8e8" }}
          >
            Još nema članova osoblja. Dodajte prvog ispod.
          </p>
        )}

        {barbers.map((barber) => {
          const color = getBarberColor(barber.id);
          const serviceCount = services.filter((service) =>
            (service.service_barbers || []).some(
              (serviceBarber: any) => serviceBarber.barber_id === barber.id
            )
          ).length;

          return (
            <div
              key={barber.id}
              className="flex items-center"
              style={{ gap: "12px", padding: "12px 0", borderTop: "1px solid #f3e8e8" }}
            >
              <div
                className="flex shrink-0 items-center justify-center rounded-full font-bold"
                style={{
                  width: "42px",
                  height: "42px",
                  fontSize: "17px",
                  backgroundColor: color.backgroundColor,
                  border: `2px solid ${color.borderColor}`,
                  color: color.textColor,
                }}
              >
                {(barber.name || "?").trim().charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="font-bold" style={{ fontSize: "16px" }}>
                  {barber.name}
                </p>

                <p className="flex items-center text-gray-500" style={{ gap: "6px", fontSize: "13px", marginTop: "2px" }}>
                  <span
                    className="shrink-0 rounded"
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: color.backgroundColor,
                      border: `1px solid ${color.borderColor}`,
                    }}
                  />
                  <span>
                    {colorNames[colorIndexFor(barber)] ?? "Vlastita"} boja u kalendaru ·{" "}
                    {uslugaLabel(serviceCount)}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteBarber(barber.id)}
                className="shrink-0 rounded-xl border bg-white font-semibold"
                style={{
                  height: "36px",
                  padding: "0 14px",
                  fontSize: "14px",
                  color: "#ef4444",
                  borderColor: "#ef4444",
                }}
              >
                Obriši
              </button>
            </div>
          );
        })}

        <div style={{ marginTop: "6px", paddingTop: "14px", borderTop: "1px solid #f3e8e8" }}>
          <label className="mb-1.5 block text-sm font-bold text-gray-700">
            Dodaj novog člana osoblja
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px" }}>
            <input
              type="text"
              placeholder="Ime, npr. Lejla"
              value={newBarberName}
              onChange={(e) => setNewBarberName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
              style={{ height: "46px", fontSize: "16px", minWidth: 0 }}
            />

            <button
              type="button"
              onClick={handleAddBarber}
              className="rounded-xl font-bold text-white transition hover:opacity-90"
              style={{
                height: "46px",
                padding: "0 18px",
                fontSize: "15px",
                backgroundColor: "#611a1a",
                whiteSpace: "nowrap",
              }}
            >
              + Dodaj
            </button>
          </div>

          <p className="text-gray-500" style={{ marginTop: "6px", fontSize: "13px", lineHeight: 1.45 }}>
            Novi član automatski dobija svoju boju u kalendaru. Zatim ga označite kod
            usluga koje radi (Postavke → Usluge).
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl border bg-white shadow-sm"
        style={{ padding: isMobile ? "16px" : "22px 24px", borderColor: "#ead1d1" }}
      >
        <p className="font-bold" style={{ fontSize: "17px", color: "#611a1a" }}>
          Izbor osoblja za klijente
        </p>

        <button
          type="button"
          role="switch"
          aria-checked={showBarbers}
          onClick={handleToggleShowBarbers}
          className="flex w-full items-start text-left"
          style={{ gap: "14px", marginTop: "14px" }}
        >
          <span
            className="relative shrink-0 rounded-full transition"
            style={{
              width: "52px",
              height: "30px",
              backgroundColor: showBarbers ? "#611a1a" : "#d1d5db",
            }}
          >
            <span
              className="absolute rounded-full bg-white transition-all"
              style={{
                top: "3px",
                left: showBarbers ? "25px" : "3px",
                width: "24px",
                height: "24px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            />
          </span>

          <span>
            <span className="block font-bold" style={{ fontSize: "16px" }}>
              Klijenti biraju člana osoblja
            </span>

            <span className="block text-gray-600" style={{ fontSize: "14px", marginTop: "4px", lineHeight: 1.45 }}>
              {showBarbers
                ? "Uključeno – na stranici salona klijent vidi osoblje kod svake usluge."
                : "Isključeno – osoblje se ne prikazuje na stranici salona."}
            </span>
          </span>
        </button>

        <div style={{ marginTop: "14px", display: "grid", gap: "8px" }}>
          {[
            {
              on: true,
              title: "Uključeno",
              text: "Klijent bira kod koga želi termin, ili „Bez preferencije“.",
            },
            {
              on: false,
              title: "Isključeno",
              text: "Klijent bira samo uslugu i termin – sistem dodjeljuje slobodnog člana osoblja.",
            },
          ].map((option) => {
            const isActive = showBarbers === option.on;

            return (
              <div
                key={option.title}
                className="rounded-xl border"
                style={{
                  padding: "10px 12px",
                  fontSize: "14px",
                  lineHeight: 1.4,
                  color: "#374151",
                  borderColor: isActive ? "#611a1a" : "#e5e7eb",
                  backgroundColor: isActive ? "#fdf7f7" : "#ffffff",
                }}
              >
                <span className="block font-bold" style={{ fontSize: "13px", color: "#111827", marginBottom: "2px" }}>
                  {isActive ? "✓ " : ""}
                  {option.title}
                </span>
                {option.text}
              </div>
            );
          })}
        </div>

        <p className="text-gray-500" style={{ marginTop: "10px", fontSize: "13px" }}>
          Promjena se čuva odmah.
        </p>
      </div>
    </div>
  </div>
  );
})()}

  </>
  )}
  </div>
  </div>
)}


       
{!isMobile && (
<div className="mb-3 flex items-center justify-between">

  <div className="flex items-center gap-2">
  <button
  onClick={() => {
    const today = new Date();
    const monday = new Date(today);
    const currentDay = today.getDay();

    const diffToMonday =
      currentDay === 0 ? -6 : 1 - currentDay;

    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    setCalendarWeekStart(monday);
  }}
  className="rounded-xl border px-4 py-2 text-sm font-medium"
  style={{
    borderColor: "#611a1a",
    color: "#611a1a",
    backgroundColor: "white",
  }}
>
  Danas
</button>
<button
  onClick={() => {
  if (showPreviousBookings) {
    setShowPreviousBookings(false);

    const today = new Date();
    const monday = new Date(today);
    const currentDay = today.getDay();

    const diffToMonday =
      currentDay === 0 ? -6 : 1 - currentDay;

    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    setCalendarWeekStart(monday);
    return;
  }

  setShowPreviousBookings(true);
}}
  className="rounded-xl border px-4 py-2 text-sm font-medium"
  style={{
    borderColor: "#611a1a",
    color: showPreviousBookings ? "#ffffff" : "#611a1a",
    backgroundColor: showPreviousBookings ? "#611a1a" : "#ffffff",
  }}
>
  Prethodne rezervacije
</button>
  {(showPreviousBookings || !isCurrentCalendarWeek) && (
  <button
    onClick={() => {
      const previousWeek = new Date(calendarWeekStart);
      previousWeek.setDate(calendarWeekStart.getDate() - 7);
      setCalendarWeekStart(previousWeek);
    }}
    className="rounded-xl border px-4 py-2 text-sm font-medium"
    style={{
      borderColor: "#611a1a",
      color: "#611a1a",
      backgroundColor: "white",
    }}
  >
    ←
  </button>
)}

  
  <div
  className="ml-2 text-sm font-semibold"
  style={{ color: "#611a1a" }}
>
  {(() => {
    const weekEnd = new Date(calendarWeekStart);
    weekEnd.setDate(calendarWeekStart.getDate() + 6);

    const months = [
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

    return `${calendarWeekStart.getDate()}. ${
      months[calendarWeekStart.getMonth()]
    } – ${weekEnd.getDate()}. ${months[weekEnd.getMonth()]}`;
  })()}
</div>

<button
    onClick={() => {
      const nextWeek = new Date(calendarWeekStart);
      nextWeek.setDate(calendarWeekStart.getDate() + 7);
      setCalendarWeekStart(nextWeek);
    }}
    className="rounded-xl border px-4 py-2 text-sm font-medium"
    style={{
      borderColor: "#611a1a",
      color: "#611a1a",
      backgroundColor: "white",
    }}
  >
    →
  </button>

  </div>

  <div
    style={{
      position: "relative",
    }}
  >
    <button
      onClick={() => setShowBarberFilterMenu(!showBarberFilterMenu)}
      className="rounded-xl border px-5 py-2 text-sm font-medium transition hover:opacity-90"
      style={{
        backgroundColor: "#ffffff",
        color: "#611a1a",
        borderColor: "#611a1a",
      }}
    >
      <span className="flex items-center gap-2">
  {calendarBarberFilter === "all"
    ? "Osooblje"
    : barbers.find((barber) => barber.id === calendarBarberFilter)?.name || "Osoblje"}

  {calendarBarberFilter !== "all" && (
    <span
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "9999px",
        backgroundColor: getBarberColor(calendarBarberFilter as number).borderColor,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  )}
</span>
    </button>
    {showBarberFilterMenu && (
  <div
    className="flex flex-col items-stretch gap-2 rounded-2xl border bg-white p-3 shadow-sm"
    style={{
      position: "absolute",
      top: "100%",
      right: 0,
      marginTop: "8px",
      width: "max-content",
      minWidth: "180px",
      borderColor: "#ead1d1",
      zIndex: 50,
    }}
  >
    <button
      onClick={() => {
        setCalendarBarberFilter("all");
        setShowBarberFilterMenu(false);
      }}
      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-gray-100"
      style={{
        color:
          calendarBarberFilter === "all" ? "#611a1a" : "#111827",
        backgroundColor:
          calendarBarberFilter === "all" ? "#f7eeee" : "#ffffff",
      }}
    >
      <span className="mr-2 w-4">
        {calendarBarberFilter === "all" ? "✓" : ""}
      </span>

      <span>Svo osoblje</span>
    </button>

    {barbers.map((barber) => (
      <button
        key={barber.id}
        onClick={() => {
          setCalendarBarberFilter(barber.id);
          setShowBarberFilterMenu(false);
        }}
        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-gray-100"
        style={{
          color:
            calendarBarberFilter === barber.id
              ? "#611a1a"
              : "#111827",
          backgroundColor:
            calendarBarberFilter === barber.id
              ? "#f7eeee"
              : "#ffffff",
        }}
      >
        <span className="mr-2 w-4">
          {calendarBarberFilter === barber.id ? "✓" : ""}
        </span>

        <span className="flex items-center gap-2">
  <span
    style={{
      width: "10px",
      height: "10px",
      borderRadius: "9999px",
      backgroundColor: getBarberColor(barber.id).borderColor,
      display: "inline-block",
      flexShrink: 0,
    }}
  />

  {barber.name}
</span>
      </button>
    ))}
  </div>
)}
  </div>

</div>
)}

{isMobile && (
  <div className="mb-3">
    <div
  style={{
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "8px",
  }}
>
    {(showPreviousBookings || !isCurrentCalendarWeek) && (
  <button
    onClick={() => {
      mobileCalendarScrollModeRef.current = "monday";

      const previousWeek = new Date(calendarWeekStart);
      previousWeek.setDate(calendarWeekStart.getDate() - 7);
      setCalendarWeekStart(previousWeek);
    }}
    className="rounded-xl border px-4 py-2 text-sm font-medium"
    style={{
      borderColor: "#611a1a",
      color: "#611a1a",
      backgroundColor: "white",
    }}
  >
    ←
  </button>
)}
    <div
      className="text-sm font-semibold"
      style={{
        color: "#611a1a",
        whiteSpace: "nowrap",
      }}
    >
      {(() => {
        const weekEnd = new Date(calendarWeekStart);
        weekEnd.setDate(calendarWeekStart.getDate() + 6);

        const months = [
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

        return `${calendarWeekStart.getDate()}. ${
          months[calendarWeekStart.getMonth()]
        } – ${weekEnd.getDate()}. ${months[weekEnd.getMonth()]}`;
      })()}
    </div>

    

    <button
      onClick={() => {
  mobileCalendarScrollModeRef.current = "monday";

  const nextWeek = new Date(calendarWeekStart);
  nextWeek.setDate(calendarWeekStart.getDate() + 7);
  setCalendarWeekStart(nextWeek);
}}
      className="rounded-xl border px-4 py-2 text-sm font-medium"
      style={{
        borderColor: "#611a1a",
        color: "#611a1a",
        backgroundColor: "white",
      }}
    >
      →
       </button>
  </div>

  <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginTop: "12px",
  }}
>
  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}
>
    <button
      onClick={() => {
  mobileCalendarScrollModeRef.current = "today";

  const today = new Date();
  const monday = new Date(today);
  const currentDay = today.getDay();

  const diffToMonday =
    currentDay === 0 ? -6 : 1 - currentDay;

  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  setCalendarWeekStart(monday);
}}
      className="rounded-xl border px-4 py-2 text-sm font-medium"
      style={{
        borderColor: "#611a1a",
        color: "#611a1a",
        backgroundColor: "white",
      }}
    >
      Danas
    </button>

    <button
      onClick={() => {
        if (showPreviousBookings) {
          setShowPreviousBookings(false);

          const today = new Date();
          const monday = new Date(today);
          const currentDay = today.getDay();

          const diffToMonday =
            currentDay === 0 ? -6 : 1 - currentDay;

          monday.setDate(today.getDate() + diffToMonday);
          monday.setHours(0, 0, 0, 0);

          setCalendarWeekStart(monday);
          return;
        }

        setShowPreviousBookings(true);
      }}
      className="rounded-xl border px-4 py-2 text-sm font-medium"
      style={{
        borderColor: "#611a1a",
        color: showPreviousBookings ? "#ffffff" : "#611a1a",
        backgroundColor: showPreviousBookings ? "#611a1a" : "#ffffff",
      }}
    >
  {(() => {
    if (calendarBarberFilter === "all") {
      return "Prethodne rezervacije";
    }

    const selectedBarber = barbers.find(
      (barber) => barber.id === calendarBarberFilter
    );

    return selectedBarber && selectedBarber.name.length >= 7
  ? "Prethodne..."
  : "Prethodne rezervacije";
  })()}
</button>
    </div>
  <div
  style={{
    position: "relative",
    flexShrink: 0,
  }}
>
  <button
    onClick={() => setShowBarberFilterMenu(!showBarberFilterMenu)}
    className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:opacity-90"
    style={{
      backgroundColor: "#ffffff",
      color: "#611a1a",
      borderColor: "#611a1a",
    }}
  >
    <span className="flex items-center gap-2">
      {calendarBarberFilter === "all"
        ? "Osoblje"
        : barbers.find(
            (barber) => barber.id === calendarBarberFilter
          )?.name || "Osoblje"}

      {calendarBarberFilter !== "all" && (
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "9999px",
            backgroundColor: getBarberColor(
              calendarBarberFilter as number
            ).borderColor,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
      )}
    </span>
  </button>
  {showBarberFilterMenu && (
  <div
    className="flex flex-col items-stretch gap-2 rounded-2xl border bg-white p-3 shadow-sm"
    style={{
      position: "absolute",
      top: "100%",
      right: 0,
      marginTop: "8px",
      width: "max-content",
      minWidth: "180px",
      borderColor: "#ead1d1",
      zIndex: 50,
    }}
  >
    <button
      onClick={() => {
        setCalendarBarberFilter("all");
        setShowBarberFilterMenu(false);
      }}
      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-gray-100"
      style={{
        color:
          calendarBarberFilter === "all" ? "#611a1a" : "#111827",
        backgroundColor:
          calendarBarberFilter === "all" ? "#f7eeee" : "#ffffff",
      }}
    >
      <span className="mr-2 w-4">
        {calendarBarberFilter === "all" ? "✓" : ""}
      </span>

      <span>Svo osoblje</span>
    </button>

    {barbers.map((barber) => (
      <button
        key={barber.id}
        onClick={() => {
          setCalendarBarberFilter(barber.id);
          setShowBarberFilterMenu(false);
        }}
        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-gray-100"
        style={{
          color:
            calendarBarberFilter === barber.id
              ? "#611a1a"
              : "#111827",
          backgroundColor:
            calendarBarberFilter === barber.id
              ? "#f7eeee"
              : "#ffffff",
        }}
      >
        <span className="mr-2 w-4">
          {calendarBarberFilter === barber.id ? "✓" : ""}
        </span>

        <span className="flex items-center gap-2">
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "9999px",
              backgroundColor: getBarberColor(barber.id).borderColor,
              display: "inline-block",
              flexShrink: 0,
            }}
          />

          {barber.name}
        </span>
      </button>
    ))}
  </div>
)}
</div>
  </div>
</div>
)}

<div
  className="mb-6 rounded-2xl border bg-white shadow-sm"
  style={{
    borderColor: "#611a1a",
    overflow: "hidden",
  }}
>
  <div
  ref={(element) => {
  mobileCalendarScrollRef.current = element;

  if (!element || !isMobile) return;

  const scrollMode = mobileCalendarScrollModeRef.current;

  // Vanlig rerender, till exempel öppna/stäng popup:
  // behåll kalenderns nuvarande horisontella position.
  if (scrollMode === "keep") return;

  const today = new Date();
  const currentDay = today.getDay();
  const dayIndex = currentDay === 0 ? 6 : currentDay - 1;

  requestAnimationFrame(() => {
    const mondayElement =
      element.querySelector<HTMLElement>(
        '[data-calendar-day-index="0"]'
      );

    if (!mondayElement) return;

    if (scrollMode === "monday") {
      element.scrollLeft = 0;
      mobileCalendarScrollModeRef.current = "keep";
      return;
    }

    const todayElement =
  element.querySelector<HTMLElement>(
    `[data-calendar-day-index="${dayIndex}"]`
  );

if (!todayElement) return;

element.scrollLeft =
  todayElement.offsetLeft - mondayElement.offsetLeft;

mobileCalendarSavedScrollLeftRef.current =
  element.scrollLeft;
   });
}}
onScroll={(e) => {
  if (!isMobile) return;

  mobileCalendarSavedScrollLeftRef.current =
    e.currentTarget.scrollLeft;
}}
className="overflow-x-auto"
>
  <div className="min-w-[1000px]">
    <div
  className="grid text-sm font-semibold"
  style={{
    gridTemplateColumns: calendarGridTemplateColumns,
    backgroundColor: "#f8eeee",
    color: "#611a1a",
    borderBottom: "1px solid rgba(97, 26, 26, 0.35)",
    minHeight: "48px",
    alignItems: "center",
  }}
>
      <div
  className="px-3 py-4"
  style={{
    borderRight: "1px solid #ead1d1",
    ...(isMobile
      ? {
          position: "sticky",
          left: 0,
          zIndex: 20,
          backgroundColor: "#f8eeee",
          boxShadow: "2px 0 0 #ead1d1",
        }
      : {}),
  }}
>
  Vrijeme
</div>

     {["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"].map(
  (day, index) => {
    const date = new Date(calendarWeekStart);
    date.setDate(calendarWeekStart.getDate() + index);

    const today = new Date();

    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    const bosnianMonths = [
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

    const formattedDate = `${date.getDate()}. ${
      bosnianMonths[date.getMonth()]
    }`;

    return (
  <div
    key={day}
    data-calendar-day-index={index}
    className="border-r border-gray-200 px-3 py-3 text-center last:border-r-0"
    style={{
      backgroundColor: isToday ? "#e8cccc" : "transparent",
    }}
  >
        <div className="font-semibold">
          {day}
        </div>

        <div className="mt-1 text-xs font-normal">
          {formattedDate}
        </div>
      </div>
    );
  }
)}
    </div>

    {calendarTimeLabels.map((time) => (
      <div
  key={time}
  className="grid last:border-b-0"
  style={{
    gridTemplateColumns: calendarGridTemplateColumns,
    borderBottom: "1px solid #ead1d1",
    minHeight: `${(calendarIntervalMinutes / 60) * 80}px`,
  }}
>
        <div
  className="px-3 text-sm font-medium text-gray-500"
  style={{
  position: isMobile ? "sticky" : "relative",
  left: isMobile ? 0 : undefined,
  zIndex: isMobile ? 10 : undefined,
  backgroundColor: isMobile ? "white" : undefined,
  borderRight: "1px solid #ead1d1",
  boxShadow: isMobile ? "2px 0 0 #ead1d1" : undefined,
}}
>
  <span
  style={{
    position: "absolute",
    left: "12px",
    top: "0px",
transform: "translateY(-50%)",
    zIndex: 4,
    backgroundColor: "white",
    paddingRight: "6px",
    lineHeight: 1,
  }}
>
  {time}
</span>

  {isCurrentTimeInsideCalendar &&
currentTimeMinutes >= getCalendarTimeMinutes(time) &&
currentTimeMinutes <
  getCalendarTimeMinutes(time) + calendarIntervalMinutes && (
    <>
      <div
        style={{
          position: "absolute",
          left: "12px",
          right: 0,
          top: `${
  ((currentTimeMinutes - getCalendarTimeMinutes(time)) / 60) * 80
}px`,
          height: "0.5px",
          backgroundColor: "#611a1a",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "8px",
          top: `calc(${
  ((currentTimeMinutes - getCalendarTimeMinutes(time)) / 60) * 80
}px - 4px)`,
          width: "9px",
          height: "9px",
          borderRadius: "50%",
          backgroundColor: "#611a1a",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />
    </>
  )}
</div>

        {Array.from({ length: 7 }).map((_, index) => {
  const cellDate = new Date(calendarWeekStart);
  cellDate.setDate(calendarWeekStart.getDate() + index);
  const today = new Date();

const isToday =
  cellDate.getFullYear() === today.getFullYear() &&
  cellDate.getMonth() === today.getMonth() &&
  cellDate.getDate() === today.getDate();

  const cellDateString = [
    cellDate.getFullYear(),
    String(cellDate.getMonth() + 1).padStart(2, "0"),
    String(cellDate.getDate()).padStart(2, "0"),
  ].join("-");

  const dayBookings = calendarWeekBookings.filter(
    (booking) => booking.booking_date === cellDateString
  );

  return (
    <div
  key={index}
  style={{
    minHeight: `${(calendarIntervalMinutes / 60) * 80}px`,
    borderRight:
  index < 6 ? "1.5px solid rgba(97, 26, 26, 0.35)" : "none",
    position: "relative",
    backgroundColor: isToday ? "#fdf8f8" : "transparent",
  }}
>
 {isCurrentTimeInsideCalendar &&
  currentTimeMinutes >= getCalendarTimeMinutes(time) &&
  currentTimeMinutes <
    getCalendarTimeMinutes(time) + calendarIntervalMinutes && (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: `${
          ((currentTimeMinutes - getCalendarTimeMinutes(time)) / 60) * 80
        }px`,
        height: "0.5px",
        backgroundColor: "#611a1a",
        zIndex: 2,
        pointerEvents: "none",
      }}
    />
  )}
      {dayBookings
  .filter((booking) => booking.booking_time.slice(0, 5) === time)
  .map((booking) => {
   const [bookingHour, bookingMinute] = booking.booking_time
  .split(":")
  .map(Number);

const bookingStart = bookingHour * 60 + bookingMinute;
const bookingEnd =
  bookingStart + (booking.duration_minutes || 30);

let overlappingBookings = [booking];
let groupChanged = true;

while (groupChanged) {
  groupChanged = false;

  for (const item of dayBookings) {
    if (overlappingBookings.some((groupItem) => groupItem.id === item.id)) {
      continue;
    }

    const [itemHour, itemMinute] = item.booking_time
      .split(":")
      .map(Number);

    const itemStart = itemHour * 60 + itemMinute;
    const itemEnd =
      itemStart + (item.duration_minutes || 30);

    const overlapsGroup = overlappingBookings.some((groupItem) => {
      const [groupHour, groupMinute] = groupItem.booking_time
        .split(":")
        .map(Number);

      const groupStart = groupHour * 60 + groupMinute;
      const groupEnd =
        groupStart + (groupItem.duration_minutes || 30);

      return itemStart < groupEnd && itemEnd > groupStart;
    });

    if (overlapsGroup) {
      overlappingBookings.push(item);
      groupChanged = true;
    }
  }
}

overlappingBookings = overlappingBookings.sort((a, b) => {
  if (a.booking_time === b.booking_time) {
    return a.id - b.id;
  }

  return a.booking_time.localeCompare(b.booking_time);
});

const barberColumns = new Map<string, number>();

for (const item of overlappingBookings) {
  const barberKey =
    item.barber_id != null
      ? `barber-${item.barber_id}`
      : `booking-${item.id}`;

  if (!barberColumns.has(barberKey)) {
    barberColumns.set(barberKey, barberColumns.size);
  }
}

const singleBarberColumns = new Map<number, number>();
const singleBarberColumnEnds: number[] = [];

if (isSingleBarberFiltered) {
  for (const item of overlappingBookings) {
    const [itemHour, itemMinute] = item.booking_time
      .split(":")
      .map(Number);

    const itemStart = itemHour * 60 + itemMinute;
    const itemEnd =
      itemStart + (item.duration_minutes || 30);

    let columnIndex = singleBarberColumnEnds.findIndex(
      (columnEnd) => columnEnd <= itemStart
    );

    if (columnIndex === -1) {
      columnIndex = singleBarberColumnEnds.length;
      singleBarberColumnEnds.push(itemEnd);
    } else {
      singleBarberColumnEnds[columnIndex] = itemEnd;
    }

    singleBarberColumns.set(item.id, columnIndex);
  }
}

const currentBarberKey =
  booking.barber_id != null
    ? `barber-${booking.barber_id}`
    : `booking-${booking.id}`;

const bookingColumn = isSingleBarberFiltered
  ? singleBarberColumns.get(booking.id) ?? 0
  : barberColumns.get(currentBarberKey) ?? 0;

const bookingWidth = isSingleBarberFiltered
  ? 100 / Math.max(singleBarberColumnEnds.length, 1)
  : 100 / Math.max(barberColumns.size, 1);


  
  const isThreeOrMoreOverlapping = barberColumns.size >= 3;

const shortCustomerName = (() => {
  const parts = booking.customer_name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0];
  }

  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}`;
})();

  const barberColor = getBarberColor(booking.barber_id);
  const isAllBarbersView = calendarBarberFilter === "all";

const isMultiStepBooking = calendarServiceSteps.some(
  (step) => step.service_id === booking.service_id
);

const isLaterOverlappingMultiStepBooking =
  isAllBarbersView &&
  isMultiStepBooking &&
  overlappingBookings.some((item) => {
    if (item.id === booking.id) return false;

    // Måste vara samma frisör
    if (item.barber_id !== booking.barber_id) return false;

    // Den andra bokningen måste också vara en flerstegstjänst
    const itemIsMultiStep = calendarServiceSteps.some(
      (step) => step.service_id === item.service_id
    );

    if (!itemIsMultiStep) return false;

    const [itemHour, itemMinute] = item.booking_time
      .split(":")
      .map(Number);

    const itemStart = itemHour * 60 + itemMinute;

    // Den här bokningen måste börja senare
    return itemStart < bookingStart;
  });
  const multiStepOverlapInset =
  isLaterOverlappingMultiStepBooking ? 4 : 0;

  const isParallelBooking = overlappingBookings.some((item) => {
  if (item.id === booking.id) return false;

  // Endast samma frisör
  if (item.barber_id !== booking.barber_id) return false;

  // Hämta stegen för den andra bokningens tjänst
  const itemServiceSteps = calendarServiceSteps.filter(
    (step) => step.service_id === item.service_id
  );

  // Ingen flerstegstjänst = ingen tillåten parallell bokning
  if (itemServiceSteps.length === 0) return false;

  const [itemHour, itemMinute] = item.booking_time
    .split(":")
    .map(Number);

  const itemStart = itemHour * 60 + itemMinute;

  let stepStart = itemStart;

  for (const step of itemServiceSteps) {
    const stepDuration = Number(step.duration_minutes) || 0;
    const stepEnd = stepStart + stepDuration;

    if (!step.is_barber_busy) {
      const isInsideFreeStep =
        bookingStart >= stepStart &&
        bookingEnd <= stepEnd;

      if (isInsideFreeStep) {
        return true;
      }
    }

    stepStart = stepEnd;
  }

  return false;
});

const shouldInsetParallelBooking =
  isAllBarbersView && isParallelBooking;

const parallelInset = shouldInsetParallelBooking ? 6 : 0;

const hasParallelBookingInside = (() => {
  if (!isAllBarbersView || !isMultiStepBooking) {
    return false;
  }

  const bookingServiceSteps = calendarServiceSteps.filter(
    (step) => step.service_id === booking.service_id
  );

  if (bookingServiceSteps.length === 0) {
    return false;
  }

  let stepStart = bookingStart;

  for (const step of bookingServiceSteps) {
    const stepDuration = Number(step.duration_minutes) || 0;
    const stepEnd = stepStart + stepDuration;

    if (!step.is_barber_busy) {
      const hasBookingInFreeStep = overlappingBookings.some((item) => {
        if (item.id === booking.id) return false;

        // Bara samma frisör
        if (item.barber_id !== booking.barber_id) return false;

        const [itemHour, itemMinute] = item.booking_time
          .split(":")
          .map(Number);

        const itemStart = itemHour * 60 + itemMinute;
        const itemEnd =
          itemStart + (item.duration_minutes || 30);

        return itemStart >= stepStart && itemEnd <= stepEnd;
      });

      if (hasBookingInFreeStep) {
        return true;
      }
    }

    stepStart = stepEnd;
  }

  return false;
})();

   return [
  <div
    key={`booking-${booking.id}`}
    onClick={() => {
  setSelectedBooking(booking);
}}
    style={{
  position: "absolute",
  zIndex: 1,
  top: "0px",
  left: `calc(${bookingColumn * bookingWidth}% + ${
  2 + parallelInset + multiStepOverlapInset
}px)`,

width: `calc(${bookingWidth}% - ${
  4 + parallelInset * 2 + multiStepOverlapInset * 2
}px)`,
  height: `${((booking.duration_minutes || 30) / 60) * 80}px`,
  backgroundColor: barberColor.backgroundColor,
color: barberColor.textColor,
border:
  hasParallelBookingInside
    ? `1px solid ${barberColor.textColor}`
    : isAllBarbersView && isParallelBooking
    ? `1px solid ${barberColor.textColor}`
    : `1px solid ${barberColor.borderColor}`,


borderRadius: "8px",
  padding:
  (booking.duration_minutes || 30) <= 30
    ? "4px 6px"
    : "6px 7px",
fontSize: "13px",
  fontWeight: 600,
boxSizing: "border-box",
cursor: "pointer",
}}
      >
       <div
  style={{
    lineHeight: isThreeOrMoreOverlapping ? 1 : 1.1,
    overflow: "hidden",
  }}
>
  <div
  style={{
    fontSize: "11px",
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    lineHeight: 1.2,
    letterSpacing: "-0.1px",
  }}
>
  {shortCustomerName}
</div>

  <div
    style={{
      marginTop:
  (booking.duration_minutes || 30) >= 60
    ? "6px"
    : isThreeOrMoreOverlapping
    ? "0px"
    : "2px",
      fontSize:
  (booking.duration_minutes || 30) >= 60
    ? "10px"
    : "9px",
      fontWeight: 500,
      opacity: 0.85,
      display: "-webkit-box",
      WebkitLineClamp:
  (booking.duration_minutes || 30) >= 60 ? 2 : 1,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    }}
  >
    {booking.service}
  </div>

  {(
  isThreeOrMoreOverlapping
    ? (booking.duration_minutes || 30) > 30
    : (booking.duration_minutes || 30) >= 60
) && (
    <div
      style={{
        marginTop:
  (booking.duration_minutes || 30) >= 60
    ? "6px"
    : isThreeOrMoreOverlapping
    ? "0px"
    : "2px",
        fontSize:
  (booking.duration_minutes || 30) >= 60
    ? "10px"
    : "9px",
        fontWeight: 500,
        opacity:
  (booking.duration_minutes || 30) >= 60
    ? 0.6
    : 0.75,
        display: "-webkit-box",
        WebkitLineClamp: 1,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {booking.barber_name || "Bez preferencije"}
    </div>
    )}
    {(booking.duration_minutes || 30) >= 60 && (
  <div
    style={{
      marginTop: "3px",
      fontSize: "9px",
      fontWeight: 500,
      opacity: 0.55,
      lineHeight: 1.1,
    }}
  >
    {booking.duration_minutes || 30} min
  </div>
)}
</div>
</div>,

hasParallelBookingInside && !isLaterOverlappingMultiStepBooking ? (
  <div
    key={`end-line-${booking.id}`}
    style={{
      position: "absolute",
      zIndex: 3,
      top: `${((booking.duration_minutes || 30) / 60) * 80 - 6}px`,
      left: `calc(${bookingColumn * bookingWidth}% + 2px)`,
      width: `calc(${bookingWidth}% - 4px)`,
      height: "6px",

      borderLeft: `1px solid ${barberColor.textColor}`,
      borderRight: `1px solid ${barberColor.textColor}`,
      borderBottom: `1px solid ${barberColor.textColor}`,

      borderBottomLeftRadius: "8px",
      borderBottomRightRadius: "8px",

      boxSizing: "border-box",
      pointerEvents: "none",
    }}
  />
) : null,

];
  })}
    </div>
  );
})}
            </div>
    ))}
  </div>
  </div>
</div>

{selectedBooking && (
  <div
    // Klick på den mörka bakgrunden stänger rutan.
    onClick={() => setSelectedBooking(null)}
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
  >
    <div
      onClick={(event) => event.stopPropagation()}
      style={{
        width: "420px",
        maxWidth: "90%",
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
      }}
    >
      <div className="flex items-start justify-between">
        <h2
          className="text-xl font-semibold"
          style={{ color: "#611a1a" }}
        >
          {selectedBooking.customer_name}
        </h2>

        <button
          onClick={() => setSelectedBooking(null)}
          style={{
            background: "none",
            border: "none",
            fontSize: "24px",
            lineHeight: 1,
            cursor: "pointer",
            color: "#611a1a",
          }}
        >
          ×
        </button>
      </div>
      {/* Uppgifterna i två kolumner: etikett till vänster, värde till höger. */}
      <div
  style={{
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns: "100px 1fr",
    columnGap: "12px",
    rowGap: "10px",
    fontSize: "15px",
  }}
>
  {(
    [
      [
        "Usluga",
        `${selectedBooking.service || "Nije odabrano"}${
          calendarServiceSteps.some(
            (step) => step.service_id === selectedBooking.service_id
          )
            ? " (usluga s više koraka)"
            : ""
        }`,
      ],
      ["Trajanje", `${selectedBooking.duration_minutes || 30} min`],
      ["Osoblje", selectedBooking.barber_name || "Bez preferencije"],
      [
        "Datum",
        selectedBooking.booking_date
          ? selectedBooking.booking_date.split("-").reverse().join(".")
          : "",
      ],
      ["Vrijeme", selectedBooking.booking_time?.slice(0, 5)],
    ] as [string, string][]
  ).map(([label, value]) => (
    <Fragment key={label}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ color: "#111827", fontWeight: 600 }}>{value}</span>
    </Fragment>
  ))}

  <span style={{ color: "#6b7280" }}>Telefon</span>
  <span style={{ fontWeight: 600 }}>
    {selectedBooking.phone ? (
      // Ringlänk: telefonen frågar själv innan samtalet startar.
      <a
        href={`tel:${String(selectedBooking.phone).replace(/[^\d+]/g, "")}`}
        style={{ color: "#611a1a", textDecoration: "underline" }}
      >
        {selectedBooking.phone}
      </a>
    ) : (
      <span style={{ color: "#9ca3af", fontWeight: 400 }}>Nije uneseno</span>
    )}
  </span>

  <span style={{ color: "#6b7280" }}>Email</span>
  <span style={{ fontWeight: 600, wordBreak: "break-all" }}>
    {selectedBooking.email ? (
      <a
        href={`mailto:${selectedBooking.email}`}
        style={{ color: "#611a1a", textDecoration: "underline" }}
      >
        {selectedBooking.email}
      </a>
    ) : (
      <span style={{ color: "#9ca3af", fontWeight: 400 }}>Nije uneseno</span>
    )}
  </span>

  <span style={{ color: "#6b7280" }}>Napomena</span>
  <span
    style={{
      color: selectedBooking.note ? "#111827" : "#9ca3af",
      fontWeight: selectedBooking.note ? 600 : 400,
    }}
  >
    {selectedBooking.note || "Nije uneseno"}
  </span>
</div>

{bookingCancelError && (
  <p
    style={{
      marginTop: "18px",
      color: "#ef4444",
      fontSize: "14px",
      fontWeight: 600,
    }}
  >
    {bookingCancelError}
  </p>
)}

{/* Avbokning: först knappen, sedan frågan "Da, otkaži" / "Ne" i rutan. */}
<div
  style={{
    marginTop: "24px",
    textAlign: "right",
  }}
>
  {confirmCancelBooking ? (
    <div>
      <p
        style={{
          marginBottom: "12px",
          fontSize: "14px",
          color: "#111827",
          textAlign: "right",
        }}
      >
        Da li ste sigurni da želite otkazati ovu rezervaciju?
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <button
          onClick={() => setConfirmCancelBooking(false)}
          disabled={isCancellingBooking}
          style={{
            backgroundColor: "#ffffff",
            color: "#111827",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Ne
        </button>
        <button
          onClick={async () => {
            await handleDelete(selectedBooking.id);
          }}
          disabled={isCancellingBooking}
          style={{
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            opacity: isCancellingBooking ? 0.6 : 1,
          }}
        >
          {isCancellingBooking ? "Otkazujem..." : "Da, otkaži"}
        </button>
      </div>
    </div>
  ) : (
    <button
      onClick={() => setConfirmCancelBooking(true)}
      style={{
        backgroundColor: "#ef4444",
        color: "white",
        border: "none",
        borderRadius: "12px",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Otkaži rezervaciju
    </button>
  )}
</div>
    </div>
  </div>
)}


      </div>
    </main>
  );
}