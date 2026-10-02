@AGENTS.md

# Salonix – regler för Claude

Salonix (tidigare Rezervisi.ba, repot heter fortfarande `rezervisi-ba`) är en
multi-salong-bokningsplattform för Bosnien och Hercegovina. Planerad domän: salonix.ba.
Stack: Next.js (App Router) + React + TypeScript, Tailwind, Supabase, Resend.
Hosting senare: Vercel.

## Språk
- All text som användare ser (kunder och admin) ska vara på **bosniska**.
- Branschneutralt: använd "Osoblje" / "član osoblja", inte "Frizer".
  När ingen person är vald heter det "Bez preferencije".
- Alla förklaringar till ägaren ska vara på **svenska**, enkla och steg för steg.
  Ägaren är ny på programmering, så förklara facktermer.

## Frysta delar – ändra INTE utan att fråga först
Punkt 1–5 i lanseringsplanen är klara: mobil- och desktopvy för kundflödet och adminpanelen.
Det gäller dessa filer:
- `app/[salonSlug]/page.tsx` (salongssidan)
- `app/times`, `app/podaci`, `app/potvrda`, `app/uspjesno`, `app/cancel` (bokningsflödet)
- `app/api/send-email/route.ts` (bokningsmejl)
- `app/admin/[salonSlug]/page.tsx` (adminpanelen)

Ändra dem bara om det finns en riktig bugg eller ett säkerhetsproblem, och fråga först.
Finjustera aldrig godkänd design "för att det ser bättre ut".

## Kod och logik som inte får förstöras
- Tekniska namn med "barber" (`barbers`, `barber_id`, `barberId`, `service_barbers`,
  `eligibleBarberIds` m.fl.) ska **inte** döpas om. Bara texten som användaren ser är neutral.
- "Bez preferencije" betyder inte "vem som helst". Bokningen måste fortfarande följa
  `service_barbers`, tillgängliga tider, stängda dagar och förkortade öppettider.
- Ändra aldrig bokningslogik när uppgiften bara gäller design.
- Mobil och desktop hålls isär med `isMobile`. En mobiländring får inte påverka desktop
  och tvärtom.
- Byt inte det globala typsnittet i `globals.css`.

## Design
- Varumärkesfärg: **#611a1a** (maroon). Röd färg för radera: #ef4444.
- Stil: vit, ren, professionell, rundade hörn, subtila kanter och skuggor.
- Typsnitt på publika sidor: DM Serif Display (rubriker), Source Sans 3 (text),
  Geist (knappar/UI), Outfit (vissa boknings-/successrubriker).

## Filer som inte används längre
`app/salon-x-old`, `app/salon-y-old`, `app/salon-z-old`, `app/admin/salon-*-old`,
`app/booking`. Ändra dem inte, och ta inte bort dem utan att fråga.

## Var vi är nu
- Punkt 6: Salonix startsida/katalog (`app/page.tsx`), **mobil först**. Den är påbörjad:
  - `salons` har fått kolumnerna `city`, `categories` (lista) och `is_published`.
  - Startsidan visar logga, rubrik och salongskort (bild, namn, kategorier, stad, adress).
    Bara salonger med `is_published = true` visas.
  - Sökning och filtrering (stad/kategori) är inte byggda än.
- Sedan: 7 desktop-startsida, 8 design/UX-kontroll, 9 QA, 10 säkerhet (RLS, admininloggning),
  11 databasstädning, 12 deploy till Vercel, 13 slutligt test i produktion.
- Säkerheten är medvetet planerad till punkt 10. Systemet är inte produktionssäkert än.
  Påpeka allvarliga problem, men börja inte säkerhetsarbetet utan att fråga.

## Arbetssätt
- Jobba i små steg: **en ändring i taget**. Ägaren testar och godkänner innan vi går vidare.
- Fråga innan filer ändras eller skapas.
- Skriv aldrig om stora delar av koden. Föreslå aldrig ny teknik eller en ny design av hela appen.
- Ändringar i databasen (Supabase) ska föreslås och godkännas först.
- Efter varje steg: berätta på svenska vad som ändrades och hur man testar det.
- Git-kommandon ges i ett enda block som går att kopiera.
