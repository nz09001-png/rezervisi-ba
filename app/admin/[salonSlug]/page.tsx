"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Cropper from "react-easy-crop";

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
  const [description, setDescription] = useState("");
const [phone, setPhone] = useState("");
const [address, setAddress] = useState("");
const [openingHours, setOpeningHours] = useState("");
const [heroPosition, setHeroPosition] = useState("center");
const [services, setServices] = useState<any[]>([]);
const [serviceName, setServiceName] = useState("");
const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
const [serviceDescription, setServiceDescription] = useState("");
const serviceFormRef = useRef<HTMLDivElement | null>(null);
const [servicePrice, setServicePrice] = useState("");
const [serviceDuration, setServiceDuration] = useState("60");
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
const [selectedDate, setSelectedDate] = useState("");
const [generatedTimes, setGeneratedTimes] = useState<any[]>([]);
const [showPreview, setShowPreview] = useState(false);
const [timesSaved, setTimesSaved] = useState(false);
const [newTime, setNewTime] = useState("");
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
const [specialDate, setSpecialDate] = useState("");
const [specialTime, setSpecialTime] = useState("");
const [notifications, setNotifications] = useState<any[]>([]);
const [barbers, setBarbers] = useState<any[]>([]);
const [newBarberName, setNewBarberName] = useState("");
const [closedDays, setClosedDays] = useState<any[]>([]);
const [closedDate, setClosedDate] = useState("");
const [closedReason, setClosedReason] = useState("");
const [closedEndDate, setClosedEndDate] = useState("");
const [bookingTab, setBookingTab] = useState("aktivne");
const [showNotifications, setShowNotifications] = useState(false);
const [showSettingsMenu, setShowSettingsMenu] = useState(false);
const [selectedSettings, setSelectedSettings] = useState<string[]>([]);
const [isUploadingImage, setIsUploadingImage] = useState(false);

function handleCancelServiceEdit() {
  setEditingServiceId(null);
  setServiceName("");
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

function toggleSetting(setting: string) {
  setSelectedSettings((prev) =>
    prev.includes(setting)
      ? prev.filter((item) => item !== setting)
      : [...prev, setting]
  );

  setShowSettingsMenu(false);
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
  async function fetchSalonInfo() {
  const { data, error } = await supabase
    .from("salons")
    .select("description, phone, address, opening_hours, hero_position")
    .eq("id", salon?.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  setDescription(data.description || "");
  setPhone(data.phone || "");
  setAddress(data.address || "");
  setOpeningHours(data.opening_hours || "");
  setHeroPosition(data.hero_position || "center");
}
async function fetchServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("salon_id", salon?.id)
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  setServices(data || []);
}
async function fetchTimes(date?: string) {
  let query = supabase
    .from("available_times")
    .select("*")
    .eq("salon_id", salon?.id);

  if (date) {
    query = query.eq("date", date);
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

  console.log("HÄMTAR NOTISER FÖR SALON ID:", salon.id);

  const { data, error } = await supabase
    .from("admin_notifications")
    .select("*")
    .eq("salon_id", salon.id)
    .order("created_at", { ascending: false });

  console.log("NOTISER DATA:", data);
  console.log("NOTISER ERROR:", error);

  if (error) {
    console.error(error);
    return;
  }

  setNotifications(data || []);
}

async function markNotificationAsRead(id: number) {
  const { error } = await supabase
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Kunde inte markera notisen som läst.");
    return;
  }

  fetchNotifications();
}

async function handleAddTime() {
  if (!newTime.trim()) {
    alert("Unesite vrijeme.");
    return;
  }
  if (times.some((item) => item.time === newTime)) {
  alert("Ovo vrijeme već postoji.");
  return;
}

  const { error } = await supabase.from("available_times").insert({
  salon_id: salon?.id,
  date: selectedDate,
  time: newTime,
})

  if (error) {
    alert("Greška pri dodavanju vremena.");
    console.error(error);
    return;
  }
  

  setNewTime("");
fetchTimes(selectedDate);
}
async function handleDeleteTime(id: number) {
  const confirmDelete = confirm(
    "Da li ste sigurni da želite obrisati vrijeme?"
  );

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("available_times")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Greška pri brisanju vremena.");
    console.error(error);
    return;
  }

  fetchTimes(selectedDate);
}
async function handleDeleteAllTimesForDate() {
  const confirmDelete = confirm(
    "Da li ste sigurni da želite obrisati sve termine za ovaj datum?"
  );

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("available_times")
    .delete()
    .eq("salon_id", salon?.id)
    .eq("date", selectedDate);

  if (error) {
    alert("Greška pri brisanju termina.");
    console.error(error);
    return;
  }

  fetchTimes(selectedDate);
}





  async function handleAddBarber() {
  if (!newBarberName.trim()) {
    alert("Unesite ime frizera.");
    return;
  }

  const { error } = await supabase
    .from("barbers")
    .insert({
      salon_id: salon?.id,
      name: newBarberName,
      is_active: true,
    });

  if (error) {
    alert("Greška pri dodavanju frizera.");
    console.error(error);
    return;
  }

  setNewBarberName("");
  fetchBarbers();
}

async function handleDeleteBarber(id: number) {
  const confirmDelete = confirm("Da li ste sigurni da želite obrisati frizera?");

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("barbers")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Greška pri brisanju frizera.");
    console.error(error);
    return;
  }

  fetchBarbers();
}

async function handleAddClosedDay() {
  if (!closedDate || !closedEndDate) {
    alert("Odaberite početni i završni datum.");
    return;
  }

  if (new Date(closedEndDate) < new Date(closedDate)) {
    alert("Završni datum ne može biti prije početnog datuma.");
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
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const { error } = await supabase
    .from("closed_days")
    .insert(dates);

  if (error) {
    alert("Greška pri dodavanju zatvorenih dana.");
    console.error(error);
    return;
  }

  setClosedDate("");
  setClosedEndDate("");
  setClosedReason("");

  fetchClosedDays();
}
async function handleDeleteClosedDay(id: number) {
  const confirmDelete = confirm("Da li ste sigurni da želite obrisati zatvoreni dan?");

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("closed_days")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Greška pri brisanju zatvorenog dana.");
    console.error(error);
    return;
  }

  fetchClosedDays();
}

async function handleAddService() {
  if (!serviceName.trim()) {
    alert("Unesite naziv usluge.");
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
  })
  .eq("id", editingServiceId)
  .select();

console.log("UPPDATERADE RADER:", updatedServices);

  if (updateError) {
  console.log(updateError);
  alert(JSON.stringify(updateError));
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
  alert(JSON.stringify(deleteStepsError));
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
    alert(JSON.stringify(insertStepsError));
    return;
  }
}

await fetchServices();
handleCancelServiceEdit();

alert("Usluga je uspješno ažurirana.");
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
})
.select()
.single();

  if (error) {
  alert(JSON.stringify(error));
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
    alert(JSON.stringify(stepError));
    return;
  }
}

setServiceName("");

  setServiceName("");
setServiceDescription("");
setServicePrice("");
setServiceDuration("60");

setShowPrice(true);
setShowDuration(true);

fetchServices();
}
  

  
async function handleDeleteService(id: number) {
  const confirmDelete = confirm("Da li ste sigurni da želite obrisati uslugu?");

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Greška pri brisanju usluge.");
    console.error(error);
    return;
  }

  fetchServices();
}

  async function handleDelete(id: number) {
    const confirmDelete = confirm("Da li ste sigurni da želite obrisati rezervaciju??");

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Nije moguće obrisati rezervaciju.");
      return;
    }

    fetchBookings();
  }

async function handleGalleryImageUpload() {
  if (!galleryFile) {
    alert("Prvo odaberite sliku za galeriju.");
    return;
  }

  const fileName = `gallery-${salon?.id}-${Date.now()}-${galleryFile.name}`;

  const { error: uploadError } = await supabase.storage
    .from("salon-images")
    .upload(fileName, galleryFile);

  if (uploadError) {
    alert("Greška pri učitavanju slike u galeriju.");
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
    alert("Slika je učitana, ali nije spremljena u galeriju.");
    console.error(insertError);
    return;
  }

  alert("Slika je dodana u galeriju.");

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
    alert("Greška pri brisanju slike iz galerije.");
    console.error(error);
    return;
  }

  fetchGalleryImages();
}
  async function handleImageUpload() {
  setIsUploadingImage(true);

  try {
    if (!selectedFile) {
      alert("Prvo odaberite sliku.");
      return;
    }

    if (!imagePreview || !croppedAreaPixels) {
      alert("Prvo odaberite područje slike.");
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
      alert("Greška pri učitavanju slike.");
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
      alert("Slika je učitana, ali nije spremljena u profil.");
      console.error(updateError);
      return;
    }

    alert("Slika je uspješno spremljena.");

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
  const { error } = await supabase
    .from("salons")
    .update({
  description: description,
  phone: phone,
  address: address,
  opening_hours: openingHours,
  hero_position: heroPosition,
})
    .eq("id", salon?.id)

  if (error) {
    alert("Greška pri spremanju podataka.");
    console.error(error);
    return;
  }

  alert("Podaci su uspješno spremljeni.");
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
  if (isLoggedIn && salon?.id) {
    fetchBookings();
    fetchSalonInfo();
    fetchServices();
    fetchTimes();
    fetchBarbers();
    fetchClosedDays();
fetchNotifications();
fetchGalleryImages();
  }
}, [isLoggedIn, salon]);



const today = new Date().toISOString().split("T")[0];
const currentDate = new Date();

const startOfWeek = new Date(currentDate);
startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);

const startOfMonth = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  1
);

const filteredBookings = bookings.filter((booking) => {
  const bookingDate = new Date(booking.booking_date);
  const matchesSalon = booking.salon === salon?.salon_name;

  if (!matchesSalon) return false;

  if (selectedDate) {
    return booking.booking_date === selectedDate;
  }

  if (filter === "today") {
    return booking.booking_date === today;
  }

  if (filter === "week") {
    return bookingDate >= startOfWeek;
  }

  if (filter === "month") {
    return bookingDate >= startOfMonth;
  }

  return true;
});

const todayDate = new Date().toISOString().split("T")[0];

const activeBookings = filteredBookings.filter(
  (booking) => booking.booking_date >= todayDate
);

const completedBookings = filteredBookings.filter(
  (booking) => booking.booking_date < todayDate
);

const todaysBookings = bookings.filter(
  (booking) => booking.booking_date === today
);

function handleGenerateTimes() {
  if (!scheduleStartDate || !scheduleEndDate) {
    alert("Odaberite početni i završni datum.");
    return;
  }

  if (!startTime || !endTime) {
    alert("Odaberite početno i završno vrijeme.");
    return;
  }

  const startDate = new Date(`${scheduleStartDate}T00:00:00`);
  const endDate = new Date(`${scheduleEndDate}T00:00:00`);

  if (startDate > endDate) {
    alert("Početni datum ne može biti nakon završnog datuma.");
    return;
  }

  const startMinutes =
    Number(startTime.split(":")[0]) * 60 +
    Number(startTime.split(":")[1]);

  const endMinutes =
    Number(endTime.split(":")[0]) * 60 +
    Number(endTime.split(":")[1]);

  if (startMinutes >= endMinutes) {
    alert("Početno vrijeme mora biti prije završnog vremena.");
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
async function handleSaveTimes() {
  if (!salon?.id) {
    alert("Salon nije pronađen.");
    return;
  }

  if (generatedTimes.length === 0) {
    alert("Nema generisanih termina za spremanje.");
    return;
  }

  const timesToSave = generatedTimes.map((slot) => ({
    salon_id: salon.id,
    date: slot.date,
    time: slot.time,
  }));

  const { data, error } = await supabase
  .from("available_times")
  .upsert(timesToSave, {
    onConflict: "salon_id,date,time",
    ignoreDuplicates: true,
  })
  .select("date, time");

console.log("Sparade tider:", data);

  if (error) {
    console.error("Greška pri spremanju termina:", error);
    alert("Došlo je do greške pri spremanju termina.");
    return;
  }

  if (!data || data.length === 0) {
  alert("Svi ovi termini već postoje.");
  return;
}

alert(`Sačuvano termina: ${data.length}`);
setTimesSaved(true);
}
async function handleReplaceTimes() {
  const confirmed = window.confirm(
  "Jeste li sigurni da želite zamijeniti postojeće termine?"
);

if (!confirmed) {
  return;
}
  if (!salon?.id) {
    alert("Salon nije pronađen.");
    return;
  }

  if (generatedTimes.length === 0) {
    alert("Nema generisanih termina.");
    return;
  }


  const uniqueDates = [...new Set(generatedTimes.map((slot) => slot.date))];

  for (const date of uniqueDates) {
    

    const { error } = await supabase
      .from("available_times")
      .delete({ count: "exact" })
      .eq("salon_id", salon.id)
      .eq("date", date);


    if (error) {
      console.error(error);
      alert("Greška pri brisanju termina.");
      return;
    }
  }

  const timesToSave = generatedTimes.map((slot) => ({
    salon_id: salon.id,
    date: slot.date,
    time: slot.time,
  }));

  const { error: insertError } = await supabase
    .from("available_times")
    .insert(timesToSave);

  if (insertError) {
    console.error(insertError);
    alert("Greška pri spremanju termina.");
    return;
  }

  await fetchTimes(scheduleStartDate);

alert("Termini uspješno zamijenjeni.");
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
    <main className="min-h-screen bg-[#f7f3ee] p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between">
  <div>
    <h1 className="text-4xl font-bold">
      {salon?.salon_name} Admin
    </h1>

    <p className="mt-2 text-gray-600">
      Administrera bokningar, tjänster, frisörer och salongsinformation.
    </p>
  </div>
{showNotifications && (
  <div className="mb-8 mt-6 rounded-2xl bg-white p-6 shadow">
  <h2 className="mb-4 text-2xl font-bold">
    🔔 Notiser
  </h2>

  {notifications.length === 0 ? (
    <p>Inga notiser.</p>
  ) : (
    <div className="space-y-3">
      {notifications.map((notification) => (
  <div
    key={notification.id}
    className="rounded-xl border p-4"
  >
    <p className="font-semibold">
      {notification.title}
    </p>

    <p className="text-gray-600">
      {notification.message}
    </p>

    {!notification.is_read && (
      <button
        onClick={() =>
          markNotificationAsRead(notification.id)
        }
        className="mt-3 rounded-lg bg-black px-4 py-2 text-white"
      >
        ✓ Markera som läst
      </button>
    )}
  </div>
))}
    </div>
  )}
</div>
)}
  

  <div className="flex items-center gap-3">
  <div style={{ position: "relative", display: "inline-block" }}>
  <button
    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
    className="h-12 rounded-xl bg-black px-5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
  >
    ⚙️ Postavke
    {selectedSettings.length > 0 && ` (${selectedSettings.length})`}
  </button>

  {showSettingsMenu && (
  <div
  className="z-50 rounded-2xl bg-white p-2 shadow"
  style={{
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: "8px",
    width: "180px",
  }}
>
    <button
      onClick={() => toggleSetting("hero")}
      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100"
style={{
  padding: "8px 12px",
}}
    >
      <span className="mr-2 w-4">
  {selectedSettings.includes("hero") ? "✓  " : ""}
</span>

<span>Naslovna slika</span>
    </button>

    <button
      onClick={() => toggleSetting("gallery")}
     className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100"
style={{
  padding: "8px 12px",
}}
    >
      {selectedSettings.includes("gallery") ? "✓  " : ""}Galerija
    </button>

    <button
      onClick={() => toggleSetting("info")}
      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100"
style={{
  padding: "8px 12px",
}}
    >
      {selectedSettings.includes("info") ? "✓  " : ""}Informacije o salonu
    </button>

    <button
      onClick={() => toggleSetting("services")}
      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100"
style={{
  padding: "8px 12px",
}}
    >
      {selectedSettings.includes("services") ? "✓  " : ""}Usluge
    </button>

    <button
      onClick={() => toggleSetting("times")}
      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100"
style={{
  padding: "8px 12px",
}}
    >
      {selectedSettings.includes("times") ? "✓  " : ""}Termini
    </button>

    <button
      onClick={() => toggleSetting("barbers")}
      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100"
style={{
  padding: "8px 12px",
}}
    >
      {selectedSettings.includes("barbers") ? "✓  " : ""}Frizeri
    </button>

    <button
      onClick={() => toggleSetting("closed")}
      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100"
style={{
  padding: "8px 12px",
}}
    >
      {selectedSettings.includes("closed") ? "✓  " : ""}Zatvoreni dani
    </button>
  </div>
)}
</div>

  <button
    onClick={() => setShowNotifications(!showNotifications)}
    className="h-12 rounded-xl bg-black px-5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
  >
    🔔 Notifikacije
  </button>

  <button
    onClick={() => setIsLoggedIn(false)}
    className="h-12 rounded-xl bg-black px-5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
  >
    Odjavi se
  </button>
</div>
</div>
<div className="mb-8 grid grid-cols-2 gap-6">
  <div className="rounded-3xl bg-white p-6 shadow">
    <p className="text-sm font-medium text-gray-500">
      Današnje rezervacije
    </p>

    <p className="mt-3 text-5xl font-semibold">
      {todaysBookings.length}
    </p>
  </div>

  <div className="rounded-3xl bg-white p-6 shadow">
    <p className="text-sm font-medium text-gray-500">
      Ukupno rezervacija
    </p>

    <p className="mt-3 text-5xl font-semibold">
      {filteredBookings.length}
    </p>
  </div>
</div>

  <div className="mb-8 flex flex-wrap items-center gap-3">
  <button
    onClick={() => setFilter("today")}
    className={`rounded-xl px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 ${
      filter === "today" ? "bg-black" : "bg-gray-500"
    }`}
  >
    Danas
  </button>

  <button
    onClick={() => setFilter("week")}
    className={`rounded-xl px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 ${
      filter === "week" ? "bg-black" : "bg-gray-500"
    }`}
  >
    Ova sedmica
  </button>

  <button
    onClick={() => setFilter("month")}
    className={`rounded-xl px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 ${
      filter === "month" ? "bg-black" : "bg-gray-500"
    }`}
  >
    Ovaj mjesec
  </button>

  <button
    onClick={() => setFilter("all")}
    className={`rounded-xl px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 ${
      filter === "all" ? "bg-black" : "bg-gray-500"
    }`}
  >
    Sve
  </button>

  <div className="ml-4 flex items-center gap-3">
    <span className="text-sm font-medium text-gray-600">
      Datum:
    </span>

    <input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className="rounded-xl border bg-white px-4 py-3"
    />
  </div>
</div>

{selectedSettings.length > 0 && (
  <>
  
    {selectedSettings.includes("hero") && (
  <div className="mb-6 rounded-3xl bg-white p-6 shadow">
  <label className="mb-2 block font-medium">Profilna slika</label>
  {salon?.image_url && (
  <img
    src={salon.image_url}
    alt="Profilna slika"
    className="mb-4 h-36 w-full max-w-md rounded-2xl object-cover"
  />
)}

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

<label
  htmlFor="hero-image-upload"
  style={{
    display: "inline-flex",
    cursor: "pointer",
    alignItems: "center",
    borderRadius: "12px",
    backgroundColor: "#611a1a",
    padding: "12px 20px",
    fontWeight: 500,
    color: "white",
  }}
>
   Izaberi profilnu sliku
</label>
{selectedFile && (
  <p
    style={{
      marginTop: "12px",
      color: "#555",
      fontSize: "15px",
    }}
  >
    Odabrana slika: <strong>{selectedFile.name}</strong>
  </p>
)}
{selectedFile && (
  <p
    style={{
      marginTop: "4px",
      color: "#777",
      fontSize: "13px",
      lineHeight: "1.5",
    }}
  >
    Preporučeni format: široka fotografija (oko 1000 × 360 px ili sličan omjer).
  </p>
)}

{imagePreview && (
  <div className="relative mt-4 h-[370px] w-full overflow-hidden rounded-2xl bg-gray-100">
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
)}
<div className="mt-6">
  <p className="mb-3 font-medium text-gray-700">
    Ovako će izgledati na stranici
  </p>

  <div
  className="w-full overflow-hidden rounded-2xl bg-gray-200"
  style={{
    height: "360px",
  }}
>
  {croppedPreviewUrl && (
    <img
      src={croppedPreviewUrl}
      alt="Hero preview"
      style={{
  width: "100%",
  height: "360px",
  objectFit: "cover",
  display: "block",
}}
    />
  )}
</div>
</div>
  {selectedFile && (
  <div className="mt-4 flex gap-3">
    <button
  onClick={handleImageUpload}
  disabled={isUploadingImage}
  className={`rounded-xl px-5 py-3 font-medium text-white transition ${
    isUploadingImage
      ? "cursor-not-allowed bg-gray-500"
      : "bg-black hover:opacity-90"
  }`}
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
  }}
  className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-black transition hover:bg-gray-100"
>
  Otkaži
</button>
  </div>
)}
</div>
)}
{selectedSettings.includes("gallery") && (
  <div className="mb-6 rounded-2xl bg-white p-4 shadow">
  <h2 className="mb-4 text-xl font-bold">Galerija slika</h2>
  <p className="mb-6 text-sm text-gray-500">
  Dodajte slike koje će se prikazivati na stranici salona.
</p>

  <input
  id="gallery-image-upload"
  type="file"
  accept="image/*"
  onChange={(e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setGalleryFile(file);
    }
  }}
  style={{ display: "none" }}
/>

<label
  htmlFor="gallery-image-upload"
  style={{
    display: "inline-flex",
    cursor: "pointer",
    alignItems: "center",
    borderRadius: "12px",
    backgroundColor: "#611a1a",
    padding: "12px 20px",
    fontWeight: 500,
    color: "white",
  }}
>
  Izaberi sliku za galeriju
</label>

{galleryFile && (
  <p className="mt-3 text-sm text-gray-600">
    Odabrana slika: <strong>{galleryFile.name}</strong>
  </p>
)}

  {galleryFile && (
  <button
    onClick={handleGalleryImageUpload}
    style={{ backgroundColor: "#611a1a" }}
    className="mt-4 rounded px-4 py-2 text-white"
  >
    Sačuvaj u galeriju
  </button>
)}

  <div
  style={{
    marginTop: "24px",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
  }}
>
    {galleryImages.map((image) => (
      <div
  key={image.id}
  className="rounded-2xl bg-white p-4 shadow"
>
        <img
  src={image.image_url}
  alt="Slika galerije"
  style={{
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "12px",
    display: "block",
  }}
/>

        <button
          onClick={() => handleDeleteGalleryImage(image.id)}
          className="mt-4 w-full rounded-xl px-3 py-2 font-medium text-white transition hover:opacity-90"
style={{ backgroundColor: "#611a1a" }}
        >
          Obriši
        </button>
      </div>
    ))}
    </div>
</div>
)}

  

{selectedSettings.includes("info") && (
  <div className="mb-6 rounded-2xl bg-white p-4 shadow">
  <h2 className="mb-4 text-xl font-bold">Informacije o salonu</h2>
  <p className="mb-6 text-sm text-gray-500">
  Ovdje možete urediti osnovne informacije koje će biti prikazane na stranici salona.
</p>

  <label className="mb-2 block font-medium">Opis</label>
  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className="mb-6 w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition focus:border-[#611a1a] focus:outline-none focus:ring-2 focus:ring-[#611a1a]/20"
    rows={3}
  />

  <label className="mb-2 block font-medium">Telefon</label>
  <input
    type="text"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    className="mb-4 w-full rounded border p-3"
  />

  <label className="mb-2 block font-medium">Adresa</label>
  <input
    type="text"
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    className="mb-4 w-full rounded border p-3"
  />

  <label className="mb-2 block font-medium">Radno vrijeme</label>
  <input
    type="text"
    value={openingHours}
    onChange={(e) => setOpeningHours(e.target.value)}
    className="mb-4 w-full rounded border p-3"
  />

  <button
  onClick={handleSalonInfoUpdate}
  className="rounded-xl px-5 py-3 font-medium text-white transition hover:opacity-90"
  style={{ backgroundColor: "#611a1a" }}
>
  Sačuvaj informacije
</button>
</div>
)}

{selectedSettings.includes("services") && (
  <div className="mb-6 rounded-2xl bg-white p-4 shadow">
  <h2 className="mb-4 text-xl font-bold">Usluge</h2>
  <p className="mb-6 text-sm text-gray-500">
  Dodajte i uredite usluge koje nudite u svom salonu.
</p>

  <div className="mb-4 space-y-2">
   {services.map((service) => (
  <div
  key={service.id}
  className="rounded-xl border p-4 transition-all"
  style={{
    backgroundColor:
      editingServiceId === service.id ? "#e5cccc" : "#ffffff",
    borderColor:
      editingServiceId === service.id ? "#611a1a" : "#e5e7eb",
    borderWidth:
      editingServiceId === service.id ? "2px" : "1px",
  }}
>
    <div>
        <p className="text-lg font-semibold">
          {service.name}
        </p>

        {service.description && (
          <p className="mt-1 text-sm text-gray-500">
            {service.description}
          </p>
        )}

       <div className="mt-2 space-y-1">
  {service.price && (
    <p className="font-bold">
      {service.price} BAM
    </p>
  )}

  {service.duration_minutes && (
    <p className="font-bold">
      Trajanje: {service.duration_minutes} min
    </p>
  )}
</div>

        <div className="mt-3 space-y-1">
          <p className="text-xs text-gray-500">
            Cijena:{" "}
            {service.show_price ? "Prikazana" : "Skrivena"}
          </p>

          <p className="text-xs text-gray-500">
            Trajanje:{" "}
            {service.show_duration ? "Prikazano" : "Skriveno"}
          </p>
                </div>
    </div>

    <div className="mt-4 flex w-full gap-2">
      <button
  type="button"
  onClick={() => handleEditService(service)}
  className="rounded-lg border px-4 py-2"
  style={{
  backgroundColor: "#ffffff",
  color: "#611a1a",
  borderColor: "#611a1a",
  marginLeft: "auto",
}}
>
  Edit
</button>

      <button
        onClick={() => handleDeleteService(service.id)}
        className="rounded-lg px-4 py-2 text-white"
        style={{
          backgroundColor: "#ef4444",
        }}
      >
        Obriši
      </button>
    </div>
  </div>
))}
  </div>

  <div ref={serviceFormRef}></div>
  <input
    type="text"
    placeholder="Naziv usluge"
    value={serviceName}
    onChange={(e) => setServiceName(e.target.value)}
    className="mb-3 w-full rounded border p-3"
  />
  <textarea
  placeholder="Opis usluge (nije obavezno)"
  value={serviceDescription}
  onChange={(e) => setServiceDescription(e.target.value)}
  className="mb-4 w-full rounded border p-3"
  rows={3}
/>

  <input
    type="text"
    placeholder="Cijena"
    value={servicePrice}
    onChange={(e) => setServicePrice(e.target.value)}
    className="mb-3 w-full rounded border p-3"
  />
  <input
  type="number"
  placeholder="Trajanje u minutama, npr. 30"
  value={hasServiceSteps ? totalDuration : serviceDuration}
  onChange={(e) => setServiceDuration(e.target.value)}
  disabled={hasServiceSteps}
  className={`mb-3 w-full rounded border p-3 ${
    hasServiceSteps
      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
      : ""
  }`}
/>

{hasServiceSteps && (
  <p className="mb-3 text-sm text-gray-500">
    Trajanje se automatski izračunava na osnovu koraka tretmana.
  </p>
)}

<label className="mb-2 flex items-center gap-2">
  <input
    type="checkbox"
    checked={showPrice}
    onChange={(e) => setShowPrice(e.target.checked)}
  />
  Prikaži cijenu klijentima
</label>

<label className="mb-4 flex items-center gap-2">
  <input
    type="checkbox"
    checked={showDuration}
    onChange={(e) => setShowDuration(e.target.checked)}
  />
  Prikaži trajanje klijentima
</label>
<label className="mb-4 flex items-center gap-2">
  <input
    type="checkbox"
    checked={hasServiceSteps}
    onChange={(e) => setHasServiceSteps(e.target.checked)}
  />
  Frizer nije zauzet tokom cijelog tretmana
</label>

{hasServiceSteps && (
  <div className="mb-4 rounded-xl border bg-gray-50 p-4">
    <h3 className="mb-2 font-semibold">
      Koraci tretmana
    </h3>

    {serviceSteps.map((step, index) => (
  <div
    key={index}
    className="mt-4 rounded-xl border bg-white p-4"
  >
    <h4 className="mb-4 text-lg font-semibold">
      Korak {index + 1}
    </h4>

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
      className="mb-3 w-full rounded-lg border p-3"
    />

    <input
  type="number"
  onWheel={(e) => e.currentTarget.blur()}
  placeholder="Trajanje (min)"
  value={step.duration_minutes}
  onChange={(e) => {
    const updatedSteps = [...serviceSteps];

    updatedSteps[index] = {
      ...updatedSteps[index],
      duration_minutes: e.target.value,
    };

    setServiceSteps(updatedSteps);
  }}
  className="mb-3 w-full rounded-lg border p-3"
/>

    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={step.is_barber_busy}
        onChange={(e) => {
          const updatedSteps = [...serviceSteps];

          updatedSteps[index] = {
            ...updatedSteps[index],
            is_barber_busy: e.target.checked,
          };

          setServiceSteps(updatedSteps);
        }}
      />

      Frizer je zauzet
    </label>
    {serviceSteps.length > 1 && (
  <div
  className="mt-6"
  style={{
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
  }}
>
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
  className="rounded-lg px-4 py-2 text-white"
  style={{ backgroundColor: "#dc2626" }}
>
  Obriši korak
</button>
  </div>
)}
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
  className="mt-4 rounded-lg border px-4 py-2"
  style={{
    backgroundColor: "#ffffff",
    color: "#611a1a",
    borderColor: "#611a1a",
  }}
>
  + Dodaj korak
</button>
  </div>
)}
<div className="flex gap-3">
  <button
    onClick={handleAddService}
    className="rounded-lg px-5 py-3 text-white font-medium"
    style={{
      backgroundColor: "#611a1a",
    }}
  >
    {editingServiceId !== null ? "Sačuvaj izmjene" : "+ Dodaj uslugu"}
  </button>

  {editingServiceId !== null && (
    <button
  onClick={handleCancelServiceEdit}
  className="rounded-lg px-5 py-3 font-medium"
  style={{
    border: "2px solid #dc2626",
    color: "#dc2626",
  }}
>
  Otkaži editovanje
</button>
  )}
</div>
</div>
)}
{selectedSettings.includes("times") && (
  <div className="mb-6 rounded-2xl bg-white p-4 shadow">
  <h2 className="mb-4 text-xl font-bold">Termini</h2>

  <h3 className="mb-2 text-lg font-semibold">
  Pregled i uređivanje termina
</h3>

<input
  type="date"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  className="mb-4 w-full rounded-lg border p-2"
/>

{selectedDate && (
  <h4 className="mb-3 text-lg font-semibold">
    Termini za {selectedDate}
  </h4>
)}
  {selectedDate && (
  <>
  {times.length === 0 ? (
    <div className="rounded-xl bg-gray-100 p-4 text-center text-gray-500">
      Nema termina za odabrani datum.
    </div>
  ) : (
    <div className="mb-4 space-y-2">
    {times.map((item) => (
      <div
        key={item.id}
        className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
      >
        <span>{item.time}</span>

        <button
  onClick={() => handleDeleteTime(item.id)}
  className="rounded bg-red-500 px-3 py-1 text-white"
>
  Obriši
</button>
      </div>
            ))}
      </div>
    )}
  </>
)}
{selectedDate && (
  <div className="mt-4">
    <label className="mb-2 block text-sm font-medium">
      Dodaj novi termin
    </label>

    <input
  type="time"
  step="1800"
  value={newTime}
  onChange={(e) => setNewTime(e.target.value)}
  className="w-full rounded-lg border p-2"
/>
    <button
  type="button"
  onClick={handleAddTime}
  className="mt-3 w-full rounded-lg border px-4 py-2 font-medium"
>
  Dodaj termin
</button>

<button
  type="button"
  onClick={handleDeleteAllTimesForDate}
  className="mt-3 w-full rounded-lg border border-red-500 px-4 py-2 font-medium text-red-600"
>
  Obriši sve termine za datum
</button>
  </div>
)}

  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
  <h3 className="text-lg font-bold">Standardni termini</h3>

  <p className="mt-1 text-sm text-gray-500">
    Odaberite radno vrijeme, interval i dane u sedmici.
  </p>

  <div className="mt-4 grid gap-4 md:grid-cols-2">
  <div>
    <label className="mb-1 block text-sm font-semibold">
      Od datuma
    </label>

    <input
      type="date"
      value={scheduleStartDate}
      onChange={(e) => setScheduleStartDate(e.target.value)}
      className="w-full rounded-xl border border-gray-300 bg-white p-3"
    />
  </div>

  <div>
    <label className="mb-1 block text-sm font-semibold">
      Do datuma
    </label>

    <input
      type="date"
      value={scheduleEndDate}
      onChange={(e) => setScheduleEndDate(e.target.value)}
      className="w-full rounded-xl border border-gray-300 bg-white p-3"
    />
  </div>
</div>

<div className="mt-4 grid gap-4 md:grid-cols-3">
  <div>
    <label className="mb-1 block text-sm font-semibold">
      Od
    </label>

    <input
      type="time"
      value={startTime}
      onChange={(e) => setStartTime(e.target.value)}
      className="w-full rounded-xl border border-gray-300 bg-white p-3"
    />
  </div>

  <div>
    <label className="mb-1 block text-sm font-semibold">
      Do
    </label>

    <input
      type="time"
      value={endTime}
      onChange={(e) => setEndTime(e.target.value)}
      className="w-full rounded-xl border border-gray-300 bg-white p-3"
    />
  </div>

  <div>
    <label className="mb-1 block text-sm font-semibold">
      Interval
    </label>

    <select
      value={intervalMinutes}
      onChange={(e) => setIntervalMinutes(e.target.value)}
      className="w-full rounded-xl border border-gray-300 bg-white p-3"
    >
      <option value="15">15 min</option>
      <option value="30">30 min</option>
      <option value="45">45 min</option>
      <option value="60">60 min</option>
    </select>
  </div>
</div>

  <div className="mt-4">
    <p className="mb-2 text-sm font-semibold">
      Dani
    </p>

    <div className="flex flex-wrap gap-2">
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
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              isSelected
                ? "bg-black text-white"
                : "border border-gray-300 bg-white text-gray-700"
            }`}
          >
            {day}
          </button>
        );
      })}
    </div>
  </div>

  <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    marginTop: "20px",
  }}
>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "12px",
    }}
  >
    <button
      type="button"
      onClick={handleGenerateTimes}
      className="rounded-xl bg-black px-5 py-3 font-semibold text-white"
    >
      Generiši termine
    </button>

    <button
  type="button"
  onClick={handleSaveTimes}
  disabled={generatedTimes.length === 0}
  className="rounded-xl px-5 py-3 font-semibold"
  style={{
    backgroundColor:
      generatedTimes.length === 0
        ? "white"
        : timesSaved
        ? "#611a1a"
        : "white",
    color:
      generatedTimes.length === 0
        ? "#611a1a"
        : timesSaved
        ? "white"
        : "#611a1a",
    border: "1px solid #611a1a",
    cursor:
      generatedTimes.length === 0 ? "not-allowed" : "pointer",
    opacity:
      generatedTimes.length === 0 ? 0.5 : 1,
  }}
>
  {timesSaved ? "Sačuvano ✓" : "Sačuvaj termine"}
</button>
<button
  type="button"
  onClick={handleReplaceTimes}
  disabled={generatedTimes.length === 0}
  className="rounded-xl px-5 py-3 font-semibold"
  style={{
    backgroundColor: "#611a1a",
    color: "white",
    border: "1px solid #611a1a",
    cursor:
      generatedTimes.length === 0 ? "not-allowed" : "pointer",
    opacity:
      generatedTimes.length === 0 ? 0.5 : 1,
  }}
>
  Zamijeni termine
</button>
  </div>
</div>
{generatedTimes.length > 0 && (
  <div className="mt-3">
    <p className="text-sm text-gray-600">
      Generisano termina: {generatedTimes.length}
    </p>

    <button
      type="button"
      onClick={() => setShowPreview(!showPreview)}
      className="mt-2 text-sm font-semibold text-black underline"
    >
      {showPreview ? "Sakrij pregled" : "Prikaži pregled"}
    </button>
  </div>
)}
{showPreview && (
  <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
    {Object.entries(
      generatedTimes.reduce((grouped: Record<string, string[]>, slot) => {
        if (!grouped[slot.date]) {
          grouped[slot.date] = [];
        }

        grouped[slot.date].push(slot.time);
        return grouped;
      }, {})
    )
      .slice(0, 5)
      .map(([date, times]) => (
        <div key={date} className="mb-4 last:mb-0">
          <p className="mb-2 font-semibold">{date}</p>

          <div className="flex flex-wrap gap-2">
            {(times as string[]).map((time) => (
              <span
                key={`${date}-${time}`}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm"
              >
                {time}
              </span>
            ))}
          </div>
        </div>
      ))}

    <p className="mt-4 text-xs text-gray-500">
      Prikazano prvih 5 dana.
    </p>
  </div>
)}
</div>
<div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
  <h3 className="text-lg font-bold">Posebni termini</h3>

  <p className="mt-1 text-sm text-gray-500">
    Dodajte ili uklonite pojedinačne termine za određene datume.
  </p>

  <div className="mt-4 grid gap-4 md:grid-cols-2">
    <div>
      <label className="mb-1 block text-sm font-semibold">
        Datum
      </label>

      <input
        type="date"
        value={specialDate}
        onChange={(e) => setSpecialDate(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white p-3"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-semibold">
        Vrijeme
      </label>

      <input
        type="time"
        value={specialTime}
        onChange={(e) => setSpecialTime(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white p-3"
      />
    </div>
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      width: "100%",
      marginTop: "20px",
    }}
  >
    <button
      type="button"
      className="rounded-xl bg-black px-5 py-3 font-semibold text-white"
    >
      Dodaj posebni termin
    </button>
  </div>
</div>
</div>
)}

{selectedSettings.includes("closed") && (
  <div className="mb-6 rounded-2xl bg-white p-4 shadow">
    <h2 className="mb-4 text-xl font-bold">Zatvoreni dani</h2>

    <div className="mb-4 space-y-2">
      {closedDays.map((day) => (
        <div key={day.id} className="rounded-xl bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{day.date}</p>
              <p className="text-sm text-gray-600">
                {day.reason || "Bez razloga"}
              </p>
            </div>

            <button
              onClick={() => handleDeleteClosedDay(day.id)}
              className="rounded bg-red-500 px-3 py-1 text-white"
            >
              Obriši
            </button>
          </div>
        </div>
      ))}
    </div>

    <label className="mb-2 block font-medium">Početni datum</label>
    <input
      type="date"
      value={closedDate}
      onChange={(e) => setClosedDate(e.target.value)}
      className="mb-3 w-full rounded border p-3"
    />

    <label className="mb-2 block font-medium">Završni datum</label>
    <input
      type="date"
      value={closedEndDate}
      onChange={(e) => setClosedEndDate(e.target.value)}
      className="mb-3 w-full rounded border p-3"
    />

    <input
      type="text"
      placeholder="Razlog (npr. godišnji odmor)"
      value={closedReason}
      onChange={(e) => setClosedReason(e.target.value)}
      className="mb-3 w-full rounded border p-3"
    />

    <button
      onClick={handleAddClosedDay}
      className="rounded bg-black px-4 py-2 text-white"
    >
      + Dodaj zatvoren dan
    </button>
  </div>
)}

{selectedSettings.includes("barbers") && (
  <div className="mb-6 rounded-2xl bg-white p-4 shadow">
    <h2 className="mb-4 text-xl font-bold">Frizeri</h2>

    <div className="mb-4 space-y-2">
      {barbers.map((barber) => (
        <div
          key={barber.id}
          className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
        >
          <span>{barber.name}</span>

          <button
            onClick={() => handleDeleteBarber(barber.id)}
            className="rounded bg-red-500 px-3 py-1 text-white"
          >
            Obriši
          </button>
        </div>
      ))}
    </div>

    <input
      type="text"
      placeholder="Ime frizera"
      value={newBarberName}
      onChange={(e) => setNewBarberName(e.target.value)}
      className="mb-3 w-full rounded border p-3"
    />

    <button
      onClick={handleAddBarber}
      className="rounded bg-black px-4 py-2 text-white"
    >
      + Dodaj frizera
    </button>
  </div>
)}

  </>
)}


       <div className="mb-6 flex gap-3">
  <button
    onClick={() => setBookingTab("aktivne")}
    className={`rounded-xl px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 ${
      bookingTab === "aktivne" ? "bg-black" : "bg-gray-500"
    }`}
  >
    Aktivne rezervacije ({activeBookings.length})
  </button>

  <button
    onClick={() => setBookingTab("zavrsene")}
    className={`rounded-xl px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 ${
      bookingTab === "zavrsene" ? "bg-black" : "bg-gray-500"
    }`}
  >
    Završene rezervacije ({completedBookings.length})
  </button>
</div>
        <div className="grid gap-4">
  {(bookingTab === "aktivne" ? activeBookings : completedBookings).map((booking) => (
    <div
  key={booking.id}
  className="rounded-3xl bg-white p-6 shadow"
>
  <div className="mb-5 flex items-start justify-between">
    <div>
      <p className="text-2xl font-semibold">
  {booking.booking_time}

  <span className="inline-block px-6 text-gray-400">
    •
  </span>

  {booking.booking_date}
</p>
    </div>

    
  </div>

  <div className="space-y-1">
  <p className="text-xl font-semibold">
    {booking.customer_name}
  </p>

  <p className="text-base font-medium text-gray-600">
    {booking.service || "Nije odabrano"} •{" "}
    {booking.barber_name || "Bilo koji frizer"}
  </p>

  <p>
    <strong>Telefon:</strong> {booking.phone}
  </p>

  <p>
  <strong>Email:</strong> {booking.email || "Nije uneseno"}
</p>
</div>

<div
  style={{
    textAlign: "right",
    marginTop: "-40px",
  }}
>
  <button
    onClick={() => handleDelete(booking.id)}
    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white"
  >
    Obriši
  </button>
</div>

</div>
))}

</div>
      </div>
    </main>
  );
}