============================================================
SALONIX – MASTER CHECKPOINT / PROJEKTSAMMANFATTNING
Senast uppdaterad: 7 oktober 2026
============================================================

VIKTIGT TILL NÄSTA CHATT:
Det här är den aktuella master-checkpointen för Salonix.
Punkt 1–7 i lanseringsplanen är KLARA och FRYSTA.
PUNKT 8 (Design/UX-kontroll av hela Salonix) är KLAR (6 oktober).
PUNKT 9 (Full QA) är KLAR (6–7 oktober).
PUNKT 10 (Säkerhet) är KLAR (7 oktober).
PUNKT 11 (Databasstädning) är KLAR (7 oktober). Se avsnitt 14.
NÄSTA: PUNKT 12 – deploy till Vercel. Fråga ägaren innan start.
- Punkt 11: bara Studio M Exclusive finns kvar. Testsalonger, salon-y,
  salon-z och alla andra salongers bokningar är raderade. Studio M töms
  helt som SISTA steg före lansering (sql/lansering-tom-studio-m.sql).
- Punkt 10: gamla /admin borttagen, admin loggar in med Supabase Auth
  (e-post + lösenord, överlever omladdning), RLS på ALLA tabeller +
  bildlagringen, bokningar via säkra databasfunktioner, kundens
  uppgifter i flikens minne i stället för i webbadressen.
- Punkt 9: hela bokningsflödet testat med riktiga testbokningar (mobil,
  desktop, riktig iPhone, mejl, avbokning via länk och från admin,
  paus-dubbelbokning). 9 buggar rättade (fynd 1, 2, 3, 6, 8, 9, 10,
  steg c och d), databasen städad (söndagstider, 2 gamla bokningar).
- Punkt 8: kundsidorna och admin är omgjorda (se avsnitt 5, 7 och 14).
Läs först: CLAUDE.md (regler) och SALONIX-KARTA.md (hur filerna hänger
ihop + testlista). Läs sedan avsnitt 14 här.

============================================================
1. PROJEKTET
============================================================
Namn: SALONIX (tidigare Rezervisi.ba). Domän (planerad): salonix.ba
GitHub-repo heter fortfarande: rezervisi-ba (branch: termini-redesign)
Logga: "SALONIX" med slogan "BRŽE | LAKŠE | ONLINE".

Salonix är en SaaS-bokningsplattform (multi-salon) för salonger och
tjänsteföretag i Bosnien och Hercegovina, liknande Fresha/Bokadirekt.
Varje salong har en egen sida via slug.
Enda salongen just nu: /salon-x (Studio M Exclusive, Sarajevo).
(Gentlemen Tuzla /salon-y och Mostar Fade /salon-z raderades i punkt 11.)
Admin: /admin/salon-x osv.

Ägaren (Salonix) står bakom plattformen och tar betalt av salongerna.
Mål för admin: så enkel att en 60-årig salongsägare förstår den efter
en dag.

============================================================
2. TEKNISK STACK
============================================================
- Next.js (App Router, version 16 – ny version, läs node_modules/next/dist/docs)
- React 19 + TypeScript
- Tailwind CSS (v4) + inline styles
- Supabase (databas)
- Resend (e-post)
- Leaflet + react-leaflet + OpenStreetMap (karta på startsidan)
- libphonenumber-js (telefonkontroll), react-datepicker, react-easy-crop (admin)
- Git/GitHub, VS Code, Terminal
- Planerad hosting: Vercel
- Kodassistent: Claude Code i Claude-appen (ändrar filer direkt, men frågar
  först). Claude har en egen webbläsarpanel i appen där den tar skärmbilder
  på mobil och desktop.
- Test på mobil: telefonen öppnar http://<datorns IP>:3000 (samma Wi-Fi).
  Datorns IP måste stå i allowedDevOrigins i next.config.ts, annars går
  inga knappar att trycka på (t.ex. inloggningen). Nu: 192.168.0.112 och
  192.168.0.18. Ändras IP:n (Systeminställningar → Wi-Fi → Detaljer) –
  lägg till den nya och starta om `npm run dev`.

============================================================
3. HUR VI ARBETAR (MYCKET VIKTIGT)
============================================================
- Ägaren är ny på programmering. Förklara på SVENSKA, enkelt, steg för steg.
- All text som användare ser ska vara på BOSNISKA.
- En ändring i taget. Ägaren testar och godkänner innan nästa steg.
- Fråga innan filer ändras eller skapas.
- Inför VARJE ändring:
  1. Läs SALONIX-KARTA.md (vilka "trådar" berörs?).
  2. Visa nuläget med skärmbilder på MOBIL och DESKTOP.
  3. Visa ett förslag som bild (tillfällig förhandsvisning i webbläsaren
     eller en testfil – ändrar ingen projektfil). Skärmbilder från
     panelen syns INTE för ägaren – de måste skickas som filer.
  4. Vänta på "kör". Ändra sedan.
  5. Visa resultatet på mobil och desktop.
  6. Ge Git-kommando i ETT kopierbart block.
  7. Lista de kommande stegen och vad de innebär (ägaren glömmer annars).
- Databasändringar (Supabase) föreslås som SQL och godkänns först.
  Ägaren kör SQL själv i Supabase → SQL Editor → New query → Run.
- Fungerande + godkänd kod/design = FRYST. Ändra inte frysta delar
  utan att fråga först.
- Mobil och desktop hålls isär (isMobile / isDesktop / isTablet).
  En ändring på ena får inte påverka den andra.
- Git-kommandon: git add ... && git commit -m "..." && git push
- Ha inte samma fil öppen och osparad i VS Code medan Claude ändrar den.
- Claude skriver ALDRIG in lösenord. Ägaren loggar in själv i admin
  (i Safari eller i Claude-appens webbläsarpanel).
- Ägaren vill ta det SAKTA: ett litet steg per meddelande, och alltid
  säga EXAKT var det görs (Supabase / VS Code / Terminal / Safari).
- En ny useState i admin-filen kan logga ut ägaren under utveckling –
  säg till i förväg, återanvänd befintlig state när det går.
- Testa kundflödet i en EGEN flik (tabs_create) när admin är inloggad.
- Databasen kan läsas med den publika nyckeln (curl mot Supabase med
  nyckeln från .env.local). Sedan punkt 10 ger bookings och
  admin_notifications TOMT svar utifrån (RLS) – det är rätt.
  Ändringar gör ägaren själv med SQL.
- Testa aldrig genom att spara/radera riktig data utan att fråga.
  Admin-test görs av ägaren med ofarliga ändringar som tas bort igen
  (t.ex. stängd dag 31.12.2027, kategori/person/tjänst "Test").
- VIKTIGT vid RLS: en ändring som stoppas av reglerna ger INGET fel –
  den sparas bara inte. Testa därför alltid: spara → ladda om → finns
  ändringen kvar?

============================================================
4. VIKTIGA REGLER I KODEN
============================================================
- Tekniska namn med "barber" (barbers, barber_id, barberId,
  service_barbers, eligibleBarberIds …) ska INTE döpas om.
  Användaren ser "Osoblje" / "član osoblja".
- "Bez preferencije" = kunden har ingen önskan om person, men bokningen
  måste ändå följa service_barbers, tillgängliga tider, stängda dagar och
  förkortade öppettider.
- Ändra aldrig bokningslogik när uppgiften bara gäller design.
  Tidsreglerna finns i TRE kopior (/times, /potvrda, admin-kalendern) –
  se SALONIX-KARTA.md tråd 3.
- FLERSTEGSTJÄNSTER MED PAUS (mycket viktigt, ägarens krav): en tjänst
  kan ha "Koraci tretmana" (service_steps). Steg med is_barber_busy =
  false är PAUS – då kan en annan kund boka samma person samtidigt.
  Dubbelbokningar under paus är MENINGEN. Admin-kalendern ritar dem som
  en bokning inuti en annan. Räkningen för överlapp/paus får ALDRIG
  ändras vid designarbete.
- Om ingen personal är vald på en tjänst tillåter bokningen ALL personal
  (/times: eligibleBarberIds tom = alla).
- Byt inte det globala typsnittet i globals.css.
- Mörkt läge är borttaget i globals.css – Salonix är alltid ljust.
- Bokningar kopplas till salong via salongens NAMN (bookings.salon =
  salons.salon_name). Byt inte salongsnamn direkt i Supabase. Namnet
  används även i databasfunktionerna och i RLS-regeln för bookings.
- SÄKERHET (punkt 10): kundsidorna rör ALDRIG tabellen bookings direkt –
  de använder supabase.rpc("get_booked_slots" / "create_booking" /
  "cancel_booking"). Bara inloggad ägare läser/ändrar bookings direkt
  (admin). Varje ny tabell MÅSTE få RLS + regler innan den används.
- Kundtext som visas i mejl escapas (görs säker).
- Salongssidan visar bara tjänster som har en kategori (tomma
  kategorier och tjänster utan kategori syns inte för kunder).
- Bokningsflödet skickar "stafettpinnen" i adressen (tråd 1): salong,
  tjänst, personal, datum, tid. Kundens uppgifter (ime, prezime,
  phoneCode, phone, normalizedPhone, email, napomena) ligger INTE i
  adressen sedan punkt 10 – /podaci sparar dem i flikens minne
  (sessionStorage, lib/customerData.ts), /potvrda och /uspjesno läser
  därifrån, /podaci fyller i fälten därifrån ("Promijeni"/"← Nazad").
  Saknas uppgifterna (ny flik) skickar /potvrda kunden till /podaci.
  /times läser date + time ur adressen (rätt vecka, tiden förvald).
  Varje tidsknapp har data-slot="datum tid" – en förvald tid som inte
  längre finns som knapp tas bort automatiskt.
- Stängda veckodagar (closed_weekdays) får aldrig lediga tider: admin
  grånar dagen i "Raspored po sedmici" och hoppar över den.
- Tar man bort en person (barbers) raderar databasen automatiskt
  personens available_times, closed_days och service_barbers (CASCADE).
  Bokningarna ligger KVAR (ingen koppling) – admin varnar därför.

============================================================
5. DESIGN
============================================================
Varumärkesfärg: #611a1a (maroon). Radera/destructive och fel: #ef4444.
Stil: vit, ren, professionell, rundade hörn, subtila kanter och skuggor.
Sidrubriker i bokningsflödet: Montserrat 700, svarta (#111827),
20 px mobil / 24 px desktop.
"Rezervacija potvrđena": vinröd (Montserrat) på vinröd bakgrund med vinröd
bock. Felrutor i kort: vinröd ram, #fff7f7.
Fältfel i formulär: röd ram + röd text under fältet.

Typsnitt:
- Montserrat (600/700): salongsnamnet, avsnittsrubriker (Informacije,
  Galerija, Usluge – mörka, 21 px mobil / 24 px desktop, samma stil via
  sectionHeadingStyle), kategorirubriker i Usluge (VERSALER, luft, vinröd),
  sidrubriker i bokningsflödet, salongens namn i sammanfattningarna
  (12 px versaler vinröd). Startsidan: KATEGORIJE, SALONI, salongskorten.
- DM Serif Display: används nu bara kvar på enstaka ställen (t.ex.
  felsidan "Salon nije pronađen"). Ersatt av Montserrat på salongssidan.
- Source Sans 3: text, information, formulär
- Geist: knappar/UI
- Outfit: informationsdelens text på salongssidan (inte längre på /cancel)
- Admin: behåller Arial (ägarens beslut – bara personalen ser admin)
- Undantag från "allt på bosniska": admin har "Powered by" + Salonix-loggan
  längst ner (ägarens val, engelska med flit).

Admin-stil (Postavke m.m.):
- Rubrik 24 px mobil / 30 px desktop + grå förklaring under.
- Kort med kant #ead1d1, rundade hörn, lätt skugga. Formulär som
  "öppnas" har vinröd ram (2 px).
- Val som runda knappar ("chips"): vald = vinröd fylld, ej vald = vit
  med grå kant. Personal visas med sin kalenderfärg.
- Primärknapp vinröd. "Odustani" vit med grå kant. "Obriši" vit med
  röd kant (#ef4444).
- Tips/info i ruta #faf7f7. Varning orange (#b45309 / #fff7ed).
- Meddelanderuta överst: grön (lyckat, 3 s) / röd (saknas eller fel, 6 s).
- Fråga-ruta mitt på skärmen: "Da, obriši" röd eller "Da, zamijeni"
  vinröd + "Odustani".
- Tidsfält på iPhone: appearance: none, min-width: 0, line-height 44px
  (annars går de ihop/text hamnar högst upp).
- Bosnisk böjning: uslugaLabel() → 1 usluga, 2–4 usluge, 5+ usluga.

Språk/format:
- Ni-form i rubriker och instruktioner ("Odaberite termin", "Unesite
  podatke"). Korta knappar behåller du-form (Rezerviši, Nastavi, Sačuvaj).
- Valuta: KM. Datum: 10.10.2026 (utan punkt på slutet).
- Öppettider visas med långt streck: 09:00–18:00.

Loggor i public/:
- salonix-horisontell-maroon.png – liggande logga, vinröd
- salonix-logo-ljus.png – stående logga med slogan, krämvit (vinröd bakgrund)

Fliknamn (app/layout.tsx): "Salonix – Rezervišite termin online",
beskrivning på bosniska, lang="bs". (Eget fliknamn per salong: punkt 12.)

Bokningsflödet – gemensam stil (5 oktober, /times /podaci /potvrda):
- Vit sida, innehåll högst 860 px brett.
- Sammanfattning överst (vit, ram #ead1d1): SALONGENS NAMN (Montserrat,
  versaler, vinröd) + tjänst + fakta (datum "Sri, 07.10.2026", tid,
  personal, pris).
- Stegrad med namn på mobil OCH desktop: USLUGA, VRIJEME, PODACI, POTVRDA.
- List längst ner (fixed, vit, skugga): vänster info, höger knapp
  (Nastavi / Završi rezervaciju). Sidan har padding-bottom 110 px.

Salongssidan (5 oktober, app/[salonSlug]/page.tsx):
- Salongsnamn i Montserrat. Informationsdel utan rutor:
  mobil "Informacije" + Instagram/Facebook/TikTok-ikoner (de ENDA ikonerna,
  klickbara) + rader ADRESA/TELEFON/RADNO VRIJEME i en ram + karta under;
  desktop tabell (ADRESA, TELEFON, RADNO VRIJEME, PRATITE NAS) + karta
  till höger. Adress = länk till Google Maps, telefon = tel-länk.
  Öppettider grupperas automatiskt ("Pon – Pet 09:00–18:00", förkortade
  dagar, "Nedjelja Zatvoreno", "Svaki dan").
- Usluge: snabbval (runda knappar per kategori, hoppar dit), kategori-
  rubriker i VERSALER. Tjänstekort: namn + pris till höger (vinrött),
  tid under, "Osoblje" ovanför rutan, Rezerviši bredvid. Desktop 2 per rad.
  Mobil: knappen "Rezerviši termin" längst ner (hoppar till Usluge, visas
  bara om salongen har tjänster med kategori).
- Ägaren vill INTE ha andra ikoner/symboler än sociala medier.

============================================================
6. FILER OCH SIDOR
============================================================
Kundsidor:
/                  → app/page.tsx (startsida/katalog) – FRYST
/[salonSlug]       → app/[salonSlug]/page.tsx (salongssida) – FRYST, omgjord 5 okt
/times             → välja tid – FRYST, omgjord 5 okt (T2 vit)
/podaci            → kunduppgifter – FRYST, omgjord 5 okt
/potvrda           → bekräfta bokning (bokningen skapas här via
                     create_booking) – FRYST, omgjord 5 okt (A)
/uspjesno          → "Rezervacija potvrđena" – omgjord 5 okt (rader som Potvrda)
/cancel            → avbokning via mejllänk (id + token, via
                     cancel_booking) – FRYST, omgjord 6 okt
(Punkt 10 ändrade bara HUR datan hämtas/sparas i de frysta sidorna –
 design och bokningsregler är orörda.)
app/api/send-email/route.ts        → bokningsmejl – FRYST
app/api/send-cancel-email/route.ts → mejl när salongen avbokar i admin
Admin:
/admin/[salonSlug] → app/admin/[salonSlug]/page.tsx – omgjord i punkt 8,
                     rättad i punkt 9, ny inloggning i punkt 10
                     (ca 8 500 rader, en enda fil)
Övrigt:
components/SalonMap.tsx → kartan på startsidan – FRYST
app/layout.tsx → fliknamn, beskrivning, språk
app/globals.css → gemensam stil (påverkar ALLA sidor)
lib/supabase.ts → kopplingen till databasen
lib/customerData.ts → kundens uppgifter i flikens minne (punkt 10)
next.config.ts → allowedDevOrigins (datorns IP för test på mobil)

Dokument i rotmappen:
- CLAUDE.md – regler för Claude + "Var vi är nu"
- SALONIX-MASTER-CHECKPOINT.md – den här filen
- SALONIX-KARTA.md – trådarna mellan filerna + testlista efter ändringar
- sql/lansering-tom-studio-m.sql – tömmer Studio M (körs SIST före lansering)

Borttagna gamla sidor: app/admin/page.tsx (punkt 10) och app/booking,
app/salon-*-old, app/admin/salon-*-old (punkt 12, de hade gamla lösenord
i koden). Adresserna visar nu "Salon nije pronađen". Finns i Gits historik.
Filen "npm" i rotmappen är skräp.
Suspense-ram (punkt 12): app/podaci, app/potvrda, app/uspjesno och
app/cancel har var sin liten layout.tsx som bara lägger en Suspense-ram
runt sidan – krävs för "npm run build" (useSearchParams). /times har
ramen inne i page.tsx. Ta inte bort dem.

Bokningsflödet: SALONG → TJÄNST → PERSONAL → TID → UPPGIFTER → BEKRÄFTA
→ BOKNING SKAPAS → NOTIS TILL ADMIN → EMAIL → "Rezervacija potvrđena".
Avbokning: kunden via /cancel (mejllänk) eller salongen i admin.

============================================================
7. ADMINPANELEN
============================================================
Startvyn (omgjord 4 oktober):
- Vit list överst: liten Salonix-logga (salonix-horisontell-maroon.png)
  + "| Admin" till vänster, "Odjavi se" som understruken länk till höger.
- Salongens namn stort + grå text "Upravljajte rezervacijama, uslugama,
  osobljem i informacijama o salonu." Desktop: Postavke + Obavijesti till
  höger om namnet. Mobil: Postavke + Obavijesti bredvid varandra under.
- Statistikkort (tunn ram #ead1d1, ingen tjock vänsterkant):
  "Danas" + siffra + "rezervacija/rezervacije" (bosnisk böjning) och
  kort 2 med filteretiketten + siffra + knappen "Statistika ▾" INNE i
  kortet (samma meny som förut: Danas, Ova sedmica, Ovaj mjesec, Datum).
- Längst ner: "Powered by" + liten Salonix-logga (grå, centrerad).
- Obavijesti-listan: oförändrad (ägaren nöjd).

Kalendern – rutnät och kort (4 oktober, mobil + desktop likadant):
- 100 px per timme (konstant calendarHourHeight, förut 80).
- Korten: förnamn + första bokstaven i efternamnet (12 px fet) och
  tjänsten under (11 px). Ingen tid, ingen "…" – texten bryts mellan ord.
  När 3–4 personer jobbar samtidigt blir korten smala och långa namn
  klipps – ägaren valde att låta det vara (alternativ D).
- Paus-dubbelbokning: kortet med paus får en vinröd rund "2" i hörnet,
  kunden i pausen får vit ram (2 px) + skugga och ligger överst.
  Den gamla lilla "bottenlinjen" och den gamla mobilkortkoden är borttagna.
- Bredd/överlapp/paus-räkning är ORÖRD.
- Rad-indelning (rättad 7 okt, QA fynd 10): kalendern börjar alltid på
  HEL timme (lägsta av veckans lediga tider och bokningar) och räcker
  till alla veckans bokningar. En bokning ritas i raden där den börjar
  och flyttas ner till exakt rätt höjd (bookingOffsetTop). Förut syntes
  en bokning bara om tiden exakt matchade en rad – en udda ledig tid
  (t.ex. 08:45 via "Jedan dan") kunde gömma alla bokningar den veckan.
- Mobil-bugg rättad: efter start/Danas gick kalendern aldrig över till
  "keep" och hoppade tillbaka till dagens datum vid varje uppdatering
  (öppna bokning, automatisk hämtning). Nu sätts
  mobileCalendarScrollModeRef = "keep" efter första hoppet till i dag.

Bokningsrutan (klick på bokning, 4 oktober, mobil + desktop):
- Kundens namn + ×. Ljus ruta (#faf7f7) med "Utorak, 06.10.2026",
  tid start–slut stort i vinrött och personal med kalenderfärg.
- Lista: Usluga, Telefon (tel-länk), Email (mailto-länk), Napomena.
- "Otkaži rezervaciju" vit med röd ram; frågan "Da li ste sigurni…" med
  Ne / Da, otkaži är oförändrad.

Kalendern – knapprad (ny, desktop och mobil var för sig):
- "Danas", ‹ ›, veckan i klartext ("5. – 11. oktobar 2026"; mobil har
  året under). Pilen bakåt syns bara om "Prikaži prošle rezervacije" är
  på ELLER man tittar på en framtida vecka (samma regel som förut).
- Strömbrytare "Prikaži prošle rezervacije" (= gamla knappen
  "Prethodne rezervacije", samma kod; av → tillbaka till denna vecka).
- Personalknappar "Svo osoblje" + varje person med kalenderfärg
  (= gamla menyn "Osoblje"/"Osooblje", samma filter). Stavfelet borta.
- Mobil: knapparna sätter fortfarande mobileCalendarScrollModeRef
  ("today" för Danas, "monday" för ‹ ›) – får inte tas bort.
- Desktop: klick på en notis i Obavijesti → kalendern hoppar till den
  veckan (+ slår på "prošle" om datumet passerat). "Prikaži u kalendaru ›"
  visas på notisen. INTE på mobil (ägarens val).
- Överlapp/paus-räkningen är ORÖRD (se ovan för korten och rad-indelningen).
- Oanvänd state kvar: showBarberFilterMenu (kan tas bort senare).

Meddelanden (hela admin):
- showNotice(text, "success" | "error") → ruta överst. Grön 3 s, röd 6 s,
  × stänger. Ersätter alla alert().
- Grön ruta efter ALLA lyckade spara/lägg till/ta bort.
- Tekniska fel visar "Greška pri spremanju usluge. Pokušajte ponovo.",
  detaljer bara i webbläsarens logg.
- askConfirm({ title, text, confirmLabel, tone }) → egen fråga-ruta
  (await, true/false). Ersätter alla 11 confirm(). Visar namn där det
  går ("Usluga „X“ će biti trajno obrisana."). Klick utanför = Odustani.

Postavke – egen helsida ovanpå kalendern:
- Knappen Postavke öppnar sidan (id="postavke-stranica", fixed,
  z-index 40). "← Nazad na kalendar", rubrik, "Šta želite promijeniti?",
  8 rutor (2 per rad desktop, 1 per rad mobil). Ett avsnitt i taget med
  "← Nazad na postavke". Tekniskt: showSettingsMenu = sidan öppen,
  selectedSettings = valt avsnitt (en i taget).
- Rutornas ordning: Slobodni termini, Zatvoreni dani, Usluge,
  Kategorije usluga, Osoblje, Informacije o salonu, Naslovna slika,
  Galerija.

Avsnitten:
1. Slobodni termini (Termini): flikar
   - "Raspored po sedmici": 5 steg (Za koga? med "Svi", period, dagar,
     tid + "Novi termin svakih", Prikaži pregled). Pregled visar
     personal, period, antal dagar, tider per dag. Orange varning att
     befintliga tider ersätts. "Sačuvaj termine" → fråga "Da, zamijeni".
     "Prikaži pregled" = gamla "Generiši termine" (samma funktion).
     Stängd veckodag (t.ex. "Ned") är grå, går inte att välja, och
     raden "Ned – neradni dan" visas. handleGenerateTimes hoppar alltid
     över stängda veckodagar (7 okt, QA steg c).
   - "Jedan dan": datum, "Za koga?" (Cijeli salon/person), rutnät med
     tider och ✕, "+ Dodaj", "Obriši sve termine za ovaj dan".
2. Zatvoreni dani: personknappar, Od/Do, Razlog med snabbknappar
   (Godišnji odmor, Praznik, Bolovanje, Edukacija) + eget fält,
   sammanfattning ("Amar neće raditi 5 dana …"), "Sačuvaj zatvorene
   dane". Listan grupperar dagar i rad (samma person + anledning) till
   en period med en Obriši (handleDeleteClosedDayGroup). Gamla dagar
   under "Prikaži prošle dane". Varje dag sparas fortfarande som egen rad.
3. Usluge: "+ Dodaj novu uslugu" överst (formuläret dolt tills öppnat,
   showServiceForm). Lista per kategori (2 per rad desktop),
   "Svo osoblje" när ingen personal vald, etiketter "Cijena/Trajanje
   skriveno", "Bez kategorije" med varning. Formulär med rubriker,
   KM/min i fälten, personal som knappar, "Tretman ima pauzu" →
   Koraci tretmana med "Osoblje radi / Pauza" + färgad stapel.
   Trajanje räknas automatiskt från stegen. Odustani tömmer nu även
   personalvalet (rättad bugg).
4. Kategorije usluga: antal tjänster per kategori, Obriši bara för tomma
   ("Prazna – klijenti je ne vide"), "Brzi izbor" med 22 förslag (bl.a.
   Muško šišanje, Šišanje i brada, Fade, Manikir) som läggs till med ett
   tryck (redan befintliga döljs), + eget namn.
5. Osoblje: rund bokstav i kalenderfärg, "Plava boja u kalendaru · 9
   usluga", "+ Dodaj" (Ime, npr. Lejla), strömbrytare "Klijenti biraju
   člana osoblja" som sparar show_barbers DIREKT.
   "Obriši" räknar personens kommande bokningar först; finns det några
   läggs en varning till i frågan: "Pažnja: Amar ima 4 buduće
   rezervacije. One ostaju u kalendaru – kontaktirajte klijente."
   (bosnisk böjning 1 / 2–4 / 5+). Borttagningen fungerar som förut.
6. Informacije o salonu: rutor O salonu (Opis, Telefon, Adresa + påminnelse
   om kartan), Radno vrijeme (Uobičajeno radno vrijeme, Neradni dani,
   Skraćeno radno vrijeme med "+ Dodaj skraćeno radno vrijeme" och
   "još nije sačuvano"), Društvene mreže. Spara-rad längst ner som alltid
   syns: "Sačuvaj promjene" sparar ALLT (även förkortade dagar).
   Öppettiderna (opening_hours) visas bara för kunder – de styr inte
   bokningsbara tider (det gör bara Slobodni termini).
7. Naslovna slika: "Trenutna slika" + "📷 Promijeni sliku"; ny bild i två
   steg (beskärning med zoomreglage 1–3× och −/+, förhandsvisning).
   Cropper oförändrad (1000:360).
8. Galerija: stor uppladdningsruta, "Nova slika" med Odustani, bilder
   numrerade i den ordning de visas på salongssidan, liten "✕ Obriši".

OBS: Admin sparar inte koordinater, stad eller startsidans kategorier
(salons.categories) – sätts i Supabase. service_categories (Kategorije
usluga) är salongens egna grupper och har inget med startsidan att göra.
Inloggning (punkt 10, design B): vinröd bakgrund, vitt kort, Salonix-
logga, salongens namn (Montserrat), "Prijava za administratora salona",
fälten Email + Lozinka, vinröd "Prijavite se" ("Prijava..." medan den
väntar). Fel: röd text "Pogrešan email ili lozinka." / "Nemate pristup
ovom salonu." (inloggning som tillhör en annan salong).
- Tekniskt: supabase.auth.signInWithPassword, kontroll att
  user.id === salons.owner_id. Sessionen sparas i webbläsaren →
  inloggningen ÖVERLEVER omladdning. "Odjavi se" = supabase.auth.signOut.
- Varje salong behöver ett eget konto: Supabase → Authentication →
  Users → Add user → Create new user (kryssa i Auto Confirm User) +
  SQL: update salons set owner_id = (select id from auth.users where
  email = '...') where slug = '...';
- Bara Studio M (salon-x) har konto nu (ägarens iCloud). Öppen
  registrering är AVSTÄNGD (Authentication → Sign In / Providers →
  "Allow new users to sign up" av).
Admin hämtar notiser och bokningar automatiskt varje minut.

============================================================
8. SUPABASE – TABELLER
============================================================
salons: id, salon_name, slug, description, phone, address,
  opening_hours (text, t.ex. "09:00-18:00"), image_url, instagram_url,
  facebook_url, tiktok_url, closed_weekdays (text[], t.ex. ["Ned"]),
  hero_position, show_barbers, city, categories (text[]),
  is_published (bool), latitude, longitude, owner_id (uuid → auth.users,
  salongens inloggning). admin_password är BORTTAGEN (punkt 10).
services (salon_id, name, description, price, duration_minutes,
  show_price, show_duration, category_id), service_categories (salon_id,
  name, sort_order), service_steps (service_id, name, duration_minutes,
  is_barber_busy, step_order), barbers (= personal: name, is_active,
  color_index), service_barbers, available_times (salon_id, barber_id,
  date, time), bookings (customer_name, phone, email, note, salon
  [= salongsnamn], booking_date, booking_time, service, service_id,
  duration_minutes, barber_name, barber_id, cancel_token, created_at),
admin_notifications (salon_id, type, title, message, event_date,
  event_time, is_read, created_at), closed_days (salon_id, date, reason,
  barber_id – en rad per dag; barber_id null = hela salongen),
  salon_shortened_hours (salon_id, weekday, start_time, end_time),
  salon_images (salon_id, image_url – ordning = id).

Kopplingar till barbers (kontrollerat 7 okt): available_times,
closed_days och service_barbers har barber_id med ON DELETE CASCADE
(raderas automatiskt). bookings.barber_id har INGEN koppling –
bokningar ligger kvar när en person tas bort.

SÄKERHET (RLS, punkt 10 – alla tabeller har RLS PÅ):
- Läsa: alla (anon + inloggade): salons, salon_images,
  salon_shortened_hours, closed_days, available_times, services,
  service_categories, service_steps, service_barbers, barbers.
- Ändra: bara salongens ägare (regel "for all to authenticated" med
  is_salon_owner(salon_id), eller is_service_owner(service_id) för
  service_steps/service_barbers). salons: bara update av ägaren.
- admin_notifications: alla får SKAPA (för en salong som finns), bara
  ägaren läser/ändrar.
- bookings: bara ägaren (salons.salon_name = bookings.salon och
  owner_id = auth.uid()). Kunder går via funktionerna nedan.
- Bildlagringen (bucket salon-images, publik läsning): bara inloggade
  får ladda upp (regel "Inloggade kan ladda upp salongsbilder").
Databasfunktioner (security definer):
- get_booked_slots(p_salon, p_date?, p_barber_id?) → upptagna tider
  (datum, tid, längd, personal, tjänst) – inga kunduppgifter.
- create_booking(p_booking jsonb) → { id }. Kontrollerar att salong,
  tjänst och personal hör ihop, namn/telefon/kod finns och att dagen
  inte passerat. Kontrollerar INTE om tiden är ledig (det gör /potvrda).
- cancel_booking(p_id, p_token) → raderar bara om id + kod stämmer,
  returnerar uppgifter till notisen (null = hittades inte).
- is_salon_owner / is_service_owner: hjälp för reglerna (bara inloggade
  får köra dem).
Supabase Security Advisor: 0 errors. Kvarvarande varningar är avsiktliga
(de tre bokningsfunktionerna får köras av alla) + "Leaked Password
Protection" (kräver troligen betalplan).

Notisernas message: nya sparas som två rader "Namn\n05.10.2026 u 09:00 ·
Personal" (admin visar namnet fetstilt). Gamla är en hel mening.

Kategorier på startsidan (måste stämma EXAKT med salons.categories):
Frizura, Barber, Nokti, Trepavice i obrve, Depilacija, Masaža,
Njega lica, Solarijum

Koordinater: räknas fram från adressen en gång och sparas med SQL.
Nya salonger måste få koordinater manuellt tills vidare.

Studio M Exclusive (id 1, /salon-x): Kranjčevićeva 15, Sarajevo,
koordinater 43.858024, 18.404882. Öppettider 09:00–18:00,
Subota 10:00–15:00 (förkortad), Nedjelja stängd. Telefon 033875-600.
Personal: Amar (blå), Jasmin (gul), Muhamed (grön), Sulejman (lila).
Tjänstekategorier: Šišanje, Brada, Farbanje (+ några testtjänster
"Bez kategorije"). Naslovna slika = salongens logga.
Inga andra salonger finns (raderade i punkt 11).
Obs: services, barbers, available_times, closed_days, admin_notifications
och bookings har INGEN databaskoppling till salons – raderas en salong
måste de rensas för hand (salon_images, service_categories och
salon_shortened_hours raderas automatiskt).

============================================================
9. STARTSIDAN (PUNKT 6 + 7 – KLAR OCH FRYST)
============================================================
Skärmstorlekar (app/page.tsx): mobil under 600 px, surfplatta 600–1023 px
(salonger 2 per rad), desktop från 1024 px (max 1200 px innehåll).

Mobil: liggande logga, vinröd topp "Sve za vašu ljepotu" + sökfält +
"Svi gradovi", KATEGORIJE (8 bildkort), SALONI med "Karta"/"Lista",
knapprad Preporučeno / Novi saloni / Najbliže meni + Otvoreno danas,
etiketter med ✕ och "Očisti sve", salongskort, vit list vid scroll med
☰-panel, sidfot.
Desktop: stående krämvit logga i vinröd topp, sökrad i en rad med
"Pretraži", kategorier 2 per rad, salonger 3 per rad, större karta.

Logik: sök (okänsligt för č ć š ž đ), stad sparas i localStorage, antal
salonger bara när stad är vald, Preporučeno-poäng med daglig rotation,
Novi saloni = högst id, Najbliže meni = plats (sparas inte), Otvoreno
danas = stängd dag > förkortade tider > vanliga tider.

============================================================
10. TESTDATA
============================================================
Punkt 11 (7 okt): 38 testsalonger, salon-y, salon-z, 207 bokningar
(194 "Barber House Sarajevo" + 13 från salon-y/z) och tabellen
available_times_backup_before_barbers är RADERADE.
Studio M har kvar sina testdata (27 bokningar, 17 tjänster, 4 personer,
lediga tider) för testerna i punkt 12–13. Allt töms före lansering med
sql/lansering-tom-studio-m.sql (se avsnitt 12).
Testtjänster i Studio M som är bra för QA: "sisanje test A" (30 min,
20 KM), "test dva" (60 min), "testetstetst" (120 min: 30 jobb, 60 paus,
30 jobb, längd dold för kunden).
Alla testbokningar från punkt 9 och 10 är avbokade.
Supabase Auth: en användare (ägarens iCloud) kopplad till Studio M.

============================================================
11. CHECKLISTA FRAM TILL LANSERING
============================================================
1. Salong/kundflöde mobil ............ ✅ KLAR & FRYST
2. Admin mobil ....................... ✅ KLAR & FRYST
3. Funktionstest mobil ............... ✅ KLAR
4. Salong/kundflöde desktop .......... ✅ KLAR & FRYST
5. Admin desktop ..................... ✅ KLAR & FRYST
6. Startsida/katalog mobil ........... ✅ KLAR & FRYST
7. Startsida desktop (+ surfplatta) .. ✅ KLAR & FRYST
8. Design/UX-kontroll av hela Salonix  ✅ KLAR (6 oktober)
9. Full QA inkl. edge cases .......... ✅ KLAR (7 oktober)
10. Säkerhet ....................... ✅ KLAR (7 oktober)
11. Databasstädning ................ ✅ KLAR (7 oktober)
12. Deploy till Vercel + salonix.ba .. ⬜
13. Slutligt smoke test i produktion . ⬜

============================================================
12. ATT KOMMA IHÅG (VIKTIGT)
============================================================
Kvar efter punkt 10 (säkerhet):
- Bokningar kopplas till salongen via NAMNET (tråd 2). Byts ett namn
  försvinner bokningar ur admin och blockerar inte tider (hände med
  "Barber House Sarajevo"). Överväg att koppla via salons.id (påverkar
  även RLS-regeln och funktionerna för bookings).
- Före lansering: Studio M är kopplad till ägarens iCloud. Ska salongens
  egen admin logga in behövs ett eget Supabase Auth-konto + owner_id
  (se avsnitt 7, Inloggning). Samma sak för varje ny salong.
- "Glömt lösenord" (Zaboravili ste lozinku?) finns inte än – ägaren
  byter lösenord åt salongen i Supabase (Authentication → Users).
- Leaked Password Protection (Supabase) kräver troligen betalplan –
  slå på vid lansering om möjligt.
- create_booking kontrollerar inte om tiden är ledig (bara /potvrda gör
  det). Två kunder som trycker exakt samtidigt kan i teorin dubbelboka.
- Alla får skapa notiser (admin_notifications) för en salong som finns –
  falska notiser är möjliga men ofarliga. Kan flyttas in i
  create_booking/cancel_booking senare.
- Personuppgifter: Bosniens lag om personuppgifter. Bekräftelse-sms/mejl
  = servicemeddelande; reklam kräver samtycke.
SISTA STEGET FÖRE LANSERING (efter punkt 13):
- Kör sql/lansering-tom-studio-m.sql i Supabase. Den tömmer Studio M:
  kvar blir bara salongen med namn, naslovna slika, adress, telefon,
  Instagram och Facebook (+ stad, startsidans kategorier, koordinater
  och inloggning). Ägarens beslut 7 okt: salongens admin bygger själv
  upp tjänster, personal, tider, beskrivning och öppettider.
- Bildfilerna från galleriet ligger kvar i Storage (syns inte).
Punkt 12 (lansering):
- ✅ Bygget rättat (7 okt): "npm run build" går igenom lokalt efter
  Suspense-ramar (layout.tsx) i /podaci, /potvrda, /uspjesno, /cancel.
  Kör alltid "npm run build" före en push som ska till Vercel.
- Fynd 5 (QA): /uspjesno säger "Potvrda rezervacije je poslana na email."
  även om mejlet misslyckades (/api/send-email svarar alltid 200, Resends
  svar läses inte). I Resends testläge når mejl BARA ägarens iCloud – en
  riktig kund får inget mejl men sidan säger att det skickats. Rättas
  samtidigt som salonix.ba kopplas till Resend: /potvrda läser svaret och
  /uspjesno visar annan text vid fel (ägarens val: alternativ B).
- Avbokningslänken i mejlet går till NEXT_PUBLIC_SITE_URL, annars
  localhost:3000 – sätt NEXT_PUBLIC_SITE_URL=https://salonix.ba på Vercel.
- Välj fliknamn och länktext per salongssida (Google/WhatsApp/Viber):
  "Studio M Exclusive – Salonix", med eller utan salongens beskrivning
  och bild. Görs i ny fil app/[salonSlug]/layout.tsx (generateMetadata),
  den frysta page.tsx rörs inte. Förslagsbilder visades 5 oktober
  (nuläge / utan beskrivning / med beskrivning + bild). Ägaren var osäker
  och vill bestämma före deploy.
- Byt OpenStreetMaps kartbilder mot en leverantör med gratisnivå (MapTiler).
- public/categories/solarijum.jpg kommer från Pinterest – byt mot en bild
  ni har rätt att använda. Övriga kategoribilder är från Unsplash (fria).
- "Najbliže meni" fungerar bara på https eller localhost.
- Mejl: koppla salonix.ba till Resend och byt avsändare från
  onboarding@resend.dev. I testläge når mejlen BARA Resend-kontots egen
  adress (ägarens iCloud).
- Mejl: byt texten "SALONIX" överst mot loggan som bild
  (https://salonix.ba/salonix-horisontell-maroon.png).
- Mejl: kalenderfilens tid räknas på servern – kontrollera tidszonen på
  Vercel (kan bli 1–2 h fel).
- Bekräftelse-sms från Salonix: kräver registrerat företag, sms-tjänst
  (Infobip/Twilio), avsändar-ID "Salonix". Byggs efter deploy. Ändra då
  texten under Telefon på /podaci till "Na ovaj broj ćete dobiti SMS
  potvrdu rezervacije." Påminnelser kräver dessutom ett schemalagt jobb.
- allowedDevOrigins i next.config.ts gäller bara utveckling – påverkar
  inte Vercel.
Allmänt:
- Efter git pull på en ny dator: kör npm install.
- .env.local sparas inte i Git – måste kopieras manuellt.

============================================================
13. IDÉER TILL SENARE
============================================================
- "Najpopularnije" (efter riktiga bokningar, via säker databasfunktion)
- "Prvi slobodan termin" (efter QA, med samma regler som /times)
- Etikett "Istaknuto" för salonger som betalar för synlighet
- Etikett "Novo" (kräver datumkolumn i salons)
- Admin: stad, kategorier och koordinater automatiskt från adressen
- Salongen väljer själv startsidans kategorier (A: kryssrutor i admin,
  B: bara Salonix via egen adminsida)
- "Za salone – registrujte svoj salon" i sidfoten (behöver kontaktuppgift)
- Brzi izbor (Kategorije usluga) anpassat efter salongens typ
  (alternativ B, läser salons.categories)
- Ändra ordning på kategorier (sort_order finns redan) och galleribilder
  (kräver ny kolumn)
- Slobodni termini: varning när tider ligger utanför öppettiderna, eller
  förifyllda Od/Do från öppettiderna
- Notisklick → rätt vecka även på mobil (ägaren valde bort det nu)
- Ta bort oanvänd state showBarberFilterMenu i admin (och oanvänd
  isThreeOrMoreOverlapping i kalenderkorten)
- Mobilkalender "M3": bredare dagar (min-bredd 1400 i st. f. 1000) så att
  namn + tjänst syns helt även när 3+ personer jobbar samtidigt
- Bokningsrutan förslag 2: knappar "Pozovi"/"Email" + paus-info
  ("Pauza 11:20–12:00 · Za vrijeme pauze: Ajdin Z")

============================================================
14. NÄSTA STEG – PUNKT 12 (DEPLOY). PUNKT 11 ÄR KLAR
============================================================
KLART i punkt 11 – databasstädning (7 oktober):
- 38 testsalonger raderade (de var tomma).
- Gentlemen Tuzla (salon-y) och Mostar Fade (salon-z) raderade med
  tjänster, personal, tider, bilder – och alla bokningar som inte är
  Studio M:s (207 st, varav 194 "Barber House Sarajevo").
- Tabellen available_times_backup_before_barbers borttagen.
- Ägarens beslut: vid lansering finns bara Studio M med namn, naslovna
  slika, adress, telefon, Instagram, Facebook. Koden ligger i
  sql/lansering-tom-studio-m.sql och körs EFTER punkt 13.
- Git: f2cae18 (lanseringskoden + dokumenten).

KLART i punkt 10 – säkerhet (7 oktober), allt testat av ägaren:
a) Supabase-mejlet: "rls_disabled_in_public" – 11 tabeller utan RLS,
   2 (available_times, services) med regler som släppte igenom alla.
b) Gamla /admin (app/admin/page.tsx, admin123) borttagen.
c) Ny admininloggning med Supabase Auth, design B (vinröd bakgrund,
   vitt kort, Email + Lozinka, röd feltext). Överlever omladdning,
   "Nemate pristup ovom salonu" vid fel salong, Odjavi se loggar ut på
   riktigt. salons.owner_id tillagd, salons.admin_password BORTTAGEN.
d) RLS på alla tabeller + bildlagringen (se avsnitt 8). Hjälpfunktioner
   is_salon_owner / is_service_owner (bara för inloggade).
e1) Öppen registrering avstängd i Supabase Auth.
e2–e4) bookings: kundsidorna använder get_booked_slots / create_booking /
   cancel_booking. Tabellen bookings bara för ägaren. Testat: bokning,
   mejl, notis, avbokning via länk (andra gången → felruta), avbokning
   från admin + mejl.
e5) Kundens uppgifter i flikens minne (lib/customerData.ts) i stället
   för i webbadressen. Testat: Promijeni (båda), ny tid, ny flik →
   /podaci, riktig bokning.
Supabase Security Advisor: 0 errors.
Git: 355df70 (b), 16fa255 (c), 06023db (e3), ba036e9 (e5).
Ändrade frysta filer (bara datahämtning, ingen design/logik):
app/[salonSlug]/page.tsx, app/times, app/podaci, app/potvrda,
app/uspjesno, app/cancel, app/admin/[salonSlug]/page.tsx (inloggning).

KLART i punkt 9 – QA (6–7 oktober):
a) Hel testbokning mobil (Amar) + desktop (Bez preferencije) i Studio M:
   bokning, "Rezervacija potvrđena", mejl till ägarens iCloud,
   avbokningslänk → "Rezervacija otkazana", admin (bokning + notiser). ✅
b) Paus-dubbelbokning: "testetstetst" 09:00–11:00 hos Amar + "sisanje
   test A" 10:00 under pausen. /times visade rätt lediga tider (30 min:
   09:30 och 10:00; 60 min: bara 09:30), Potvrda godkände, admin visade
   "2" + vit ram på mobil och desktop. ✅
c) Söndagstider: kunder kunde aldrig boka (Zatvoreno vinner), men 768
   överblivna tider togs bort med SQL (ägaren). Admin grånar nu stängda
   veckodagar i "Raspored po sedmici" och hoppar över dem. ✅
d) Borttagen person: tider/stängda dagar/tjänstekopplingar raderas
   automatiskt (CASCADE), bokningar ligger kvar. Admin varnar nu om
   kommande bokningar i frågan "Obrisati člana osoblja?". ✅
e) Riktig iPhone (kundsidor + admin): allt fungerar. ✅
f) Bokningsmejl i mörkt läge OK, avbokningsmejl från admin OK,
   admin-kalendern rättad (fynd 10). ✅

Rättade fynd (alla sparade i Git):
1. "Promijeni"/"← Nazad" på Potvrda tömde fälten på /podaci.
2. Telefon på Potvrda visades "+387 061 …" → nu "+387 61 …"
   (libphonenumber formatInternational, sparat nummer oförändrat).
3. "← Nazad" från /podaci glömde vald tid och vecka.
6. Passerad dag hette ibland "Zatvoreno" → alltid "Dan je prošao",
   radbryts på mobil ("Dan je / prošao").
8. Potvrda visade sluttid trots dold längd → bara starttid då.
9. "Promijeni" i rutan TERMIN → ny tid → fälten tomma. Nu följer tid och
   kunduppgifter med via /times.
10. Admin-kalendern kunde gömma bokningar (se avsnitt 7).
11. Två kommande bokningar på "Barber House Sarajevo" (Studio M:s gamla
   namn) borttagna av ägaren med SQL.
Beslut: fynd 4 (vald tid ljus) var bara muspekaren – inget fel.
Fynd 7: kunden ser "Bez preferencije" (inte personens namn) på
/uspjesno och i mejlet – ägarens val (A). Fynd 5 → punkt 12.

KLART i punkt 8 – kundsidor och mejl (3 oktober):
- Salongssidan mobil: "Rezerviši" syns även när personal är dold.
- Mörkt läge borttaget i globals.css (alltid ljus design).
- "← Nazad" på /podaci kommer ihåg vald personal (barberId).
- Svensk text → bosniska (laddning, kalenderfil, admin-felruta).
- Fel salongsadress: "Salon nije pronađen" + "Nazad na početnu".
- Telefontexten på /podaci lovar inte påminnelser.
- KM överallt. Datum 10.10.2026 överallt (även mejl och notiser).
- Ni-form i rubriker/instruktioner.
- /cancel, /uspjesno, /podaci, /potvrda, /times: felrutor, texter och
  "Nema slobodnih termina ove sedmice" + "Sljedeća sedmica →".
- Salongssidan: ringlänk, öppettider med långt streck, galleripilar,
  vit list med Salonix-logga, sidfot som startsidan.
- Bokningsmejl (alternativ A) + avbokningsmejl från admin.

KLART i punkt 8 – admin (3–4 oktober), se avsnitt 7 för detaljer:
- Postavke som egen helsida med 8 rutor, alla 8 avsnitt omgjorda.
- Meddelanderuta (grön/röd) i stället för alert, egen fråga-ruta i
  stället för confirm.
- Kalenderns knapprad desktop + mobil.
- Kalenderkorten (namn + tjänst, vinröd "2", vit ram i pausen),
  100 px per timme, mobil + desktop.
- Mobilkalendern hoppar inte längre tillbaka till dagens datum.
- Bokningsrutan (dag/datum/tid överst, personalfärg, Otkaži med röd ram).
- Headern (vit list med logga, Odjavi se som länk), statistikkort med
  Statistika i kortet, "Powered by Salonix" längst ner.


KLART i punkt 8 – salongssidan och bokningsflödet (5 oktober):
- Salongssidan: Montserrat-namn, kompakt informationsdel (mobil K2,
  desktop K1), nya tjänstekort, snabbval + kategorirubriker, avsnitts-
  rubriker i Montserrat (lika stora), "Rezerviši termin" längst ner (mobil).
- /times (T2 vit): alla 7 dagar i kolumner, "DANAS", stängda dagar gråa,
  lika höga dagrubriker, ‹ 5. – 11. okt › (bakåt grå på aktuell vecka),
  list "Odabrano: Sri, 07.10. u 09:30" + Nastavi. Tidsreglerna ORÖRDA.
  Rutan "Nema slobodnih termina" räknar tidsknapparna i calendarRef –
  lägg aldrig andra knappar inne i kalendern.
- /podaci: rubrik "Vaši podaci", grå fältramar (vinröd vid fokus, röd vid
  fel), hjälptext under Email ("Ako unesete email, dobit ćete potvrdu i
  link za otkazivanje."), list "Korak 3 od 4" + Nastavi. Kontrollerna
  oförändrade.
- /potvrda (A): "Provjerite rezervaciju", kort TERMIN (salong, tjänst,
  datum, tid start–slut, personal, pris) och VAŠI PODACI (namn, telefon,
  email om ifylld, napomena), "Promijeni"-länkar (→ /times resp. /podaci),
  "Završi rezervaciju" ensam i listen längst ner (inget "Ukupno").
  OBS: formattedDate används i admin-notisen – rör den inte. Visningen
  använder displayDate/displayTime (displayTime = bara starttid om
  tjänstens längd är dold). Båda "Promijeni" och felrutans knapp behåller
  kundens uppgifter (sedan punkt 10 via flikens minne, inte adressen).
- /uspjesno (A): vinröd bakgrund + vinröd bock kvar, rubrik i Montserrat,
  salong + tjänst + rader Datum/Vrijeme (start–slut, bara start om tiden
  är dold)/Osoblje/Cijena (om synlig)/Klijent.
- Fliknamn per salong: flyttat till punkt 12 (ägaren bestämmer före deploy).

ARBETSSÄTT SOM FUNGERADE (ägaren):
- Visa FLERA alternativ som bilder (mobil + desktop) – ägaren väljer,
  ofta en blandning. Ägaren vill ha det enkelt, kompakt, tydligt och
  professionellt. Vit bakgrund (inte beige). Inga ikoner/symboler utom
  sociala medier.
- "Testa X så får vi se" = lägg in, visa, ägaren bestämmer behålla/ändra.
- Förslagsbilder görs som testfiler i scratchpad + en tillfällig lokal
  server (python3 -m http.server 8765), bilder skickas som filer.
- En sida/ändring i taget, testa efter varje (utan att skapa bokningar).

KLART i punkt 8 – avbokningssidan (6 oktober):
- /cancel: vinröd bakgrund, vitt kort UTAN logga och UTAN bokningens
  uppgifter (ägarens val). Rubrik "Otkaži rezervaciju" (Montserrat, mörk),
  knapp "Otkaži rezervaciju" vit med röd ram → frågan "Da li ste
  sigurni…?" med "Da, otkaži" (röd) och "Ne, zadrži rezervaciju" →
  klart: GRÅ bock, "Rezervacija otkazana", knapp "Rezervišite novi termin"
  (→ "/"). Felrutorna oförändrade. Sedan punkt 10 sker radering +
  token-kontroll i databasfunktionen cancel_booking; admin-notisen som
  förut. Läget "otkazana" testat med riktiga bokningar i punkt 9 och 10.

PÅGÅR – punkt 12 (deploy), startad 7 oktober:
- ✅ 12a Bygget fungerar (Suspense-ramar, commit cf78fa3). Gamla sidor
  borttagna (e105f99).
- Domänen salonix.ba är INTE köpt. Ägaren är bosnisk medborgare (JMBG)
  utan företag → registrera som privatperson hos en registrar från
  nic.ba (OUticu/registrari). Fråga om handlingar, pris och om DNS kan
  ändras själv. Kundmejl (Resend) kräver domänen → lansering väntar på den.
- Vercel-projektet heter troligen "rezervisi-ba" (kopplat till GitHub).
  Ägaren vet inte mer. Branchen termini-redesign ger bara förhandsbyggen
  – produktion byggs från main (beslut om sammanslagning senare).

- ✅ 12b Vercel (8 oktober): projektet "rezervisi-ba" (plan Hobby).
  Environment Variables (Production + Preview): RESEND_API_KEY (Secret),
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL = https://rezervisi-ba-alpha.vercel.app (byts till
  https://salonix.ba när domänen finns). Alla tidigare Vercel-fel berodde
  på saknade nycklar ("supabaseUrl is required").
  main flyttad fram till termini-redesign (78174a1). Den nya Salonix
  ligger på https://rezervisi-ba-alpha.vercel.app (okänd adress, INTE
  lansering – ägarens val: lansera först med salonix.ba).
  Testat där: startsida, salongssida, /times, admin, riktig bokning,
  mejl, avbokningslänk (fungerar på internet), avbokning.
- PUBLICERA NY VERSION: jobba i termini-redesign, kör npm run build,
  sedan i Terminal:
  git checkout main && git merge --ff-only termini-redesign && git push origin main && git checkout termini-redesign
  Vercel bygger automatiskt. Misslyckas bygget på "Google Fonts"/
  Montserrat är det tillfälligt → Redeploy. "Instant Rollback" på
  Vercel tar tillbaka föregående version.
- Före lansering: uppgradera Vercel till Pro (Hobby får inte användas
  kommersiellt) och slå på 2FA på Vercel-kontot.

NÄSTA – I DEN HÄR ORDNINGEN:
1. PUNKT 12 – resten (fråga ägaren innan start, en sak i taget):
   12c salonix.ba (när köpt) → Vercel Domains + byt NEXT_PUBLIC_SITE_URL,
   12d Resend-domän (kräver salonix.ba) + fynd 5 (kan göras före),
   12e MapTiler, solarijum.jpg, fliknamn per salong, eget Auth-konto
   för Studio M:s admin.
2. Punkt 13: slutligt test i produktion.
3. Sist: kör sql/lansering-tom-studio-m.sql (tömmer Studio M).

============================================================
SLUT PÅ MASTER CHECKPOINT – 7 OKTOBER 2026
============================================================
