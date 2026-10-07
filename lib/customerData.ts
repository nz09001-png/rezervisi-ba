// Kundens uppgifter i bokningsflödet (/podaci → /potvrda → /uspjesno).
// De sparas i webbläsarens minne för fliken (sessionStorage) i stället för i
// webbadressen, så att namn, telefon och e-post inte hamnar i historik och
// serverloggar. Minnet försvinner när fliken stängs.

export type CustomerData = {
  ime: string;
  prezime: string;
  phoneCode: string;
  phone: string;
  normalizedPhone: string;
  email: string;
  napomena: string;
};

const STORAGE_KEY = "salonix-kunduppgifter";

const emptyCustomerData: CustomerData = {
  ime: "",
  prezime: "",
  phoneCode: "",
  phone: "",
  normalizedPhone: "",
  email: "",
  napomena: "",
};

// Reserv om sessionStorage är avstängt: en kopia i sidans minne. Den räcker
// mellan sidorna i flödet, eftersom de byts utan omladdning.
let memoryCopy: CustomerData | null = null;

export function saveCustomerData(data: CustomerData) {
  memoryCopy = { ...data };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Minnet kan vara avstängt (t.ex. vissa privata lägen) – kopian ovan används.
  }
}

export function readCustomerData(): CustomerData {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return { ...emptyCustomerData, ...JSON.parse(saved) };
  } catch {
    // Faller tillbaka på kopian nedan.
  }
  return { ...emptyCustomerData, ...(memoryCopy || {}) };
}
