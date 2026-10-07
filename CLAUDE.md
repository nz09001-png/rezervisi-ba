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
Punkt 1–7 i lanseringsplanen är klara: kundflödet, adminpanelen och startsidan
(mobil, surfplatta och desktop). Det gäller dessa filer:
- `app/[salonSlug]/page.tsx` (salongssidan)
- `app/times`, `app/podaci`, `app/potvrda`, `app/uspjesno`, `app/cancel` (bokningsflödet)
- `app/api/send-email/route.ts` (bokningsmejl)
- `app/admin/[salonSlug]/page.tsx` (adminpanelen)
- `app/page.tsx` och `components/SalonMap.tsx` (startsidan och kartan)

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
- Typsnitt på publika sidor: Montserrat (salongsnamn, avsnittsrubriker,
  kategorirubriker, sidrubriker i bokningsflödet), Source Sans 3 (text),
  Geist (knappar/UI). DM Serif Display och Outfit finns bara kvar på enstaka
  ställen (felsidan "Salon nije pronađen", avbokningssidan, infotext).
  På startsidan: Montserrat för sektionsrubrikerna (KATEGORIJE, SALONI – versaler,
  luft mellan bokstäverna, vinröd) och för salongsnamnen på korten.
- Loggor i `public/`: `salonix-horisontell-maroon.png` (liggande, vinröd) och
  `salonix-logo-ljus.png` (stående med slogan "BRŽE | LAKŠE | ONLINE", krämvit utan
  bakgrund, för vinröd bakgrund).
- Fliknamn, beskrivning och språk (`lang="bs"`) sätts i `app/layout.tsx`.

## Filer som inte används längre
`app/salon-x-old`, `app/salon-y-old`, `app/salon-z-old`, `app/admin/salon-*-old`,
`app/booking`. Ändra dem inte, och ta inte bort dem utan att fråga.

## Var vi är nu
- Punkt 6 och 7: Salonix startsida/katalog (`app/page.tsx`) – **KLAR och FRYST**
  på mobil, surfplatta och desktop. Ändra den inte utan att fråga först.
  Skärmstorlekar (känns av med `isDesktop` / `isTablet` i `app/page.tsx`):
  - Mobil: under 600 px. Standardvyn.
  - Surfplatta: 600–1023 px. Som mobil, men salongerna 2 per rad.
  - Desktop: från 1024 px. Innehållet centrerat (högst 1200 px), vinröd topp med
    stående logga + slogan, rubrik och sökrad (sök | stad | "Pretraži") i en rad,
    kategorier 2 per rad (höga kort), salonger 3 per rad, vit list med hel logga och
    "☰ Kategorije", sidfot på en rad.
  Innehåll på mobil:
  - Vinröd topp: rubrik "Sve za vašu ljepotu", sökfält och stadsval ("Svi gradovi").
    Vald stad sparas i kundens webbläsare (localStorage).
  - Åtta kategorikort med bilder (`public/categories/`): Frizura, Barber, Nokti,
    Trepavice i obrve, Depilacija, Masaža, Njega lica, Solarijum.
    Namnen måste stämma exakt med `salons.categories` i Supabase.
  - Vit list som följer med vid scroll: Salonix-ikon, ☰ (kategoripanel från vänster), sökfält.
  - Knapprad: Preporučeno (standard), Novi saloni, Najbliže meni (ordning, en åt gången)
    och Otvoreno danas (filter).
    - Preporučeno: öppet i dag + komplett profil (bild, öppettider, adress) ger poäng,
      samma poäng roteras dagligen.
    - Novi saloni: högst `id` först.
    - Najbliže meni: kundens plats (sparas inte). Nekar kunden öppnas kartan.
  - Etiketter för valda filter med ✕ och "Očisti sve".
  - Antal salonger visas bara när en stad är vald, aldrig totalt.
  - Salongskort: bild med kategorietikett, namn, adress (+ avstånd), "Otvoreno/Zatvoreno danas", pil.
  - Karta (knappen "Karta"): `components/SalonMap.tsx`, Leaflet + OpenStreetMap.
  - Sidfot med logga och © Salonix.
  - Kategoripanelen (☰): små ikoner utan cirklar, samma på mobil och desktop.
- **Punkt 10 – säkerhet KLAR (7 oktober).** Nästa: **punkt 11 – databasstädning**
  (fråga ägaren innan start). Detaljer: `SALONIX-MASTER-CHECKPOINT.md` avsnitt 8 och 14.
  - Admin loggar in med Supabase Auth (e-post + lösenord, överlever omladdning),
    `salons.owner_id` kopplar kontot till salongen, `admin_password` är borttagen.
    Bara Studio M har konto än – andra salonger behöver konto före lansering.
  - RLS på ALLA tabeller. Kundsidorna rör aldrig `bookings` direkt utan använder
    `supabase.rpc("get_booked_slots" / "create_booking" / "cancel_booking")`.
    En ändring som RLS stoppar ger inget fel – testa med spara → ladda om.
  - Kundens uppgifter ligger i flikens minne (`lib/customerData.ts`), inte i adressen.
- **Punkt 9 – QA KLAR (7 oktober).** I punkt 9:
  - Hela flödet testat med riktiga testbokningar (mobil, desktop, riktig iPhone,
    mejl, avbokning via länk och från admin, paus-dubbelbokning). Alla avbokade.
  - Rättat: Promijeni/Nazad behåller kundens uppgifter och vald tid (tråd 1 –
    `/potvrda` skickar ime/prezime/phoneCode/phone/email/napomena + date/time
    till `/podaci` och `/times`, `/times` läser date/time och skickar kunddata
    vidare), telefonen formateras på Potvrda, "Dan je prošao" alltid för
    passerad dag, Potvrda visar bara starttid när längden är dold.
  - `/times`: tidsknapparna har `data-slot="datum tid"`; en förvald tid som inte
    finns som knapp tas bort. Inga nya knappar i kalendern (tråd 10).
  - Admin: stängda veckodagar grå i "Raspored po sedmici" och hoppas över;
    "Obriši" i Osoblje varnar om kommande bokningar; kalendern börjar på hel
    timme och placerar bokningar på rätt höjd (förut kunde de bli osynliga).
  - Databas: 768 söndagstider och 2 bokningar på "Barber House Sarajevo"
    (Studio M:s gamla namn) borttagna av ägaren. barbers → CASCADE för
    available_times/closed_days/service_barbers, bokningar ligger kvar.
  - Ägarens val: kunden ser "Bez preferencije" (inte personens namn).
    Fynd 5 (mejltexten på /uspjesno) skjuts till punkt 12.
- **Punkt 8 – design/UX-kontroll KLAR (6 oktober).** Nedan står vad som gjordes i punkt 8.
- **Punkt 8 – detaljer.** Kundsidor och mejl är klara. I admin
  (`app/admin/[salonSlug]/page.tsx`) är **Postavke och alla 8 avsnitt omgjorda**
  (3 oktober 2026). Admin behåller Arial.
  - Postavke är en egen helsida ovanpå kalendern (`id="postavke-stranica"`, fixed,
    z-index 40): "← Nazad na kalendar", 8 rutor, ett avsnitt i taget med
    "← Nazad na postavke". Brytaren är den gamla `showSettingsMenu`,
    avsnittet väljs med `selectedSettings` (en i taget).
  - Gemensam stil i avsnitten: rubrik 24/30 px, förklaring under, kort med
    #ead1d1-kant, val som runda knappar ("chips"), vinröda knappar, "Odustani" grå,
    "Obriši" med röd kant, tips i #faf7f7-ruta. Bosnisk böjning av "usluga" via
    `uslugaLabel()` (1 usluga, 2–4 usluge, 5+ usluga).
  - Usluge: "+ Dodaj novu uslugu" överst (formuläret dolt tills öppnat,
    `showServiceForm`), lista per kategori (2 per rad desktop), "Svo osoblje" när
    ingen personal är vald (bokningen tillåter då alla), "Bez kategorije" med varning
    (syns inte för kunder), formulär med rubriker/KM/min/personal-knappar,
    "Tretman ima pauzu" med Osoblje radi/Pauza och färgad stapel.
    Rättad bugg: Odustani tömmer nu även personalvalet.
  - Slobodni termini (Termini): flikar "Raspored po sedmici" (5 steg, "Svi",
    Prikaži pregled = gamla handleGenerateTimes, Pregled, orange varning om ersättning)
    och "Jedan dan" (rutnät med ✕). Tidsfält har iPhone-rättning
    (`appearance: none`, `min-width: 0`, `line-height: 44px`).
  - Zatvoreni dani: knappar, sammanfattning, perioder grupperas till en rad med en
    Obriši (ny `handleDeleteClosedDayGroup`), gamla dagar under "Prikaži prošle dane".
  - Osoblje: kalenderfärg + antal tjänster per person, strömbrytaren
    "Klijenti biraju člana osoblja" sparar `show_barbers` direkt.
  - Galerija: stor uppladdningsruta, "Nova slika" med Odustani, numrerade bilder.
  - Naslovna slika: "Trenutna slika" / "Nova naslovna slika" i två steg med
    zoomreglage (1–3×). Cropper oförändrad.
  - Informacije o salonu: rutor O salonu / Radno vrijeme / Društvene mreže,
    "+ Dodaj skraćeno radno vrijeme" (`showShortenedForm`), "još nije sačuvano" på
    osparade rader, spara-rad som alltid syns längst ner. Ingen veckoöversikt
    (ägarens val). Öppettiderna (`opening_hours`) visas bara för kunder, de styr
    inte bokningsbara tider.
  - Kategorije usluga: antal tjänster, Obriši bara för tomma kategorier (med fråga),
    "Brzi izbor" med 22 förslag (samma för alla salonger, alternativ A) som läggs
    till med ett tryck. `service_categories` är salongens egna grupper och har inget
    med startsidans `salons.categories` att göra.
  - Meddelanderuta `showNotice()` (grön/röd) ersätter alert(), egen fråga-ruta
    `askConfirm()` ersätter confirm(). Kalenderns knapprad omgjord på desktop och
    mobil (4 oktober). Detaljer: `SALONIX-MASTER-CHECKPOINT.md` avsnitt 7 och 14.
  - Kalenderkort (4 oktober, mobil + desktop): `calendarHourHeight = 100` px per
    timme, kort med namn ("Nedim Z") + tjänst utan "…", vinröd "2" på kortet som
    har en kund i pausen, kunden i pausen vit ram + skugga. Smala kort när 3+
    jobbar samtidigt klipps (ägarens val). Mobilbugg rättad: kalendern hoppar
    inte längre tillbaka till dagens datum (`mobileCalendarScrollModeRef` →
    "keep"). Danas/‹ ›/swipe ska fungera exakt som nu.
  - Bokningsrutan: dag + datum + tid start–slut överst med personalfärg, lista
    Usluga/Telefon/Email/Napomena (länkar), "Otkaži" vit med röd ram.
  - Header: vit list med liten Salonix-logga + "Admin", "Odjavi se" som länk,
    salongens namn + "Upravljajte rezervacijama…", statistikkort ("Danas" +
    kort med "Statistika ▾" inuti), "Powered by" + logga längst ner (engelska
    med flit – ägarens undantag). Obavijesti-listan oförändrad (ägaren nöjd).
  - Flerstegstjänster med paus: under paus-steg (`is_barber_busy = false`) får andra
    kunder boka samma person. Dubbelbokningen är meningen. Kalenderns räkning för
    överlapp/paus får aldrig ändras vid designarbete.
- **Salongssidan och bokningsflödet omgjorda (5 oktober)** – detaljer i
  `SALONIX-MASTER-CHECKPOINT.md` avsnitt 5 och 14:
  - Salongssidan: Montserrat-namn, kompakt informationsdel (mobil: rader i ram +
    sociala ikoner vid "Informacije"; desktop: tabell + karta), snabbval för
    kategorier, kategorirubriker i VERSALER, tjänstekort (pris till höger),
    avsnittsrubriker lika stora (`sectionHeadingStyle`), "Rezerviši termin"
    längst ner på mobil.
  - `/times`, `/podaci`, `/potvrda`: vit sida, sammanfattning med salongens namn,
    stegnamn, list längst ner med Nastavi / Završi rezervaciju. `/potvrda` har
    två kort (Termin + Vaši podaci) med "Promijeni". `/uspjesno`: rader som
    Potvrda, vinröd bakgrund och bock kvar. Ingen bokningslogik ändrad.
  - Viktigt: `/times` räknar tidsknappar i `calendarRef` för "Nema slobodnih
    termina" – lägg inga andra knappar i kalendern. `/potvrda`: `formattedDate`
    används i admin-notisen, visningen använder `displayDate`/`displayTime`.
  - Ägaren vill inte ha ikoner/symboler utom sociala medier, och vit bakgrund.
  - `/cancel` (6 oktober): vinröd bakgrund, vitt kort utan logga och utan
    bokningens uppgifter, "Otkaži rezervaciju" med röd ram, "Da, otkaži" /
    "Ne, zadrži rezervaciju", grå bock + "Rezervišite novi termin" när klart.
- **Nästa: punkt 11 – databasstädning.** Fråga ägaren innan start, en sak i taget.
  Fråga alltid innan en riktig testbokning skapas. När admin är inloggad i
  webbläsarpanelen: testa kundsidor i en egen flik.
- Ägaren vill se FLERA alternativ som bilder (mobil + desktop) och välja; enkelt
  men tydligt. "Testa X" = lägg in och visa, ägaren bestämmer sedan.
- Idéer efter punkt 8: Brzi izbor anpassat efter salongens typ (alternativ B),
  ordning på kategorier (`sort_order` finns) och galleribilder (kräver kolumn),
  varning/förifyllda tider i Slobodni termini utifrån öppettiderna, salongen väljer
  själv startsidans kategorier.
- Databasen: `salons` har `city`, `categories`, `is_published`, `latitude`, `longitude`.
  Koordinater räknas fram från adressen en gång (geokodning) och sparas med SQL.
  Adminpanelen sparar inte koordinater än, så nya salonger måste få koordinater manuellt.
- Testsalonger finns (slug börjar med `test-`, ca 38 st). De behålls till punkt 11
  och tas bort då med: `delete from salons where slug like 'test-%';`
  I punkt 11 även: 194 gamla bokningar med `salon = 'Barber House Sarajevo'`.
- Sedan: 11 databasstädning, 12 deploy till Vercel (bygget misslyckas just nu på Vercel –
  kör `npm run build` först), 13 slutligt test i produktion.
- Att komma ihåg till punkt 12: varje riktig salong behöver ett Supabase Auth-konto
  + `owner_id` (se checkpoint avsnitt 7, Inloggning). Varje ny tabell måste få RLS.
- Att komma ihåg till punkt 12: välj fliknamn och länktext per salongssida
  ("Studio M Exclusive – Salonix", med/utan beskrivning och bild) – ny fil
  `app/[salonSlug]/layout.tsx`. Ägaren vill bestämma före deploy.
- Att komma ihåg till punkt 12: byt OpenStreetMaps kartbilder mot en leverantör
  med gratisnivå (t.ex. MapTiler) innan lansering.
- Att komma ihåg till punkt 12: kategoribilderna i `public/categories/` kommer från
  Unsplash (fria att använda), utom `solarijum.jpg` som kommer från Pinterest och
  måste bytas mot en bild ni har rätt att använda innan lansering.
- Idéer till senare: "Najpopularnije" (efter riktiga bokningar, via säker databasfunktion),
  "Prvi slobodan termin" (efter QA, med samma regler som `/times`), etiketten "Istaknuto"
  för betald synlighet, etiketten "Novo" (kräver datumkolumn i `salons`).

## Arbetssätt
- Jobba i små steg: **en ändring i taget**. Ägaren testar och godkänner innan vi går vidare.
- Fråga innan filer ändras eller skapas.
- Skriv aldrig om stora delar av koden. Föreslå aldrig ny teknik eller en ny design av hela appen.
- Ändringar i databasen (Supabase) ska föreslås och godkännas först.
- Efter varje steg: berätta på svenska vad som ändrades och hur man testar det.
- Git-kommandon ges i ett enda block som går att kopiera.
- Inför en designändring: visa nuläget och en förslagsbild (mobil + desktop) först.
  Skärmbilder från webbläsarpanelen syns inte för ägaren – skicka dem som filer.
  Vänta på "kör" innan koden ändras.
- Ägaren loggar in i admin själv. En ny `useState` i admin-filen loggar ut ägaren
  under utveckling – säg till i förväg och återanvänd befintlig state när det går.
- Testa aldrig genom att spara eller radera riktig data utan att fråga.

## Sammanfattning / checkpoint
- Den fullständiga projektsammanfattningen finns i `SALONIX-MASTER-CHECKPOINT.md`.
- När ägaren ber om en sammanfattning eller checkpoint: uppdatera den filen med
  **samma struktur och samma rubriker (1–14)**, ändra datumet, lägg till allt nytt
  och ta bort det som inte längre stämmer. Visa sedan hela texten i ett kodblock
  så att den går att kopiera, och ge ett Git-kommando som sparar filen.
