============================================================
SALONIX – MASTER CHECKPOINT / PROJEKTSAMMANFATTNING
Senast uppdaterad: 4 oktober 2026 (kväll)
============================================================

VIKTIGT TILL NÄSTA CHATT:
Det här är den aktuella master-checkpointen för Salonix.
Punkt 1–7 i lanseringsplanen är KLARA och FRYSTA.
Vi är i SLUTET av punkt 8: Design/UX-kontroll av hela Salonix.
- Kundsidorna (startsida, salongssida, bokningsflöde, avbokning, mejl)
  är genomgångna och fixade.
- Admin är genomgången och omgjord: Postavke som egen sida, alla 8
  avsnitt, meddelanderutor, egen fråga-ruta, kalenderns knapprad,
  kalenderkorten (namn + tjänst, vinröd "2" vid paus-dubbelbokning),
  bokningsrutan och headern med Salonix-logga (desktop + mobil).
  Se avsnitt 7 och 14.
- Kvar i punkt 8: eget fliknamn per salongssida (B) och salongsnamn i
  Montserrat (A). Förslaget är visat – väntar på ägarens "kör".
  Sedan punkt 9 (QA).
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
Riktiga salonger just nu: /salon-x (Studio M Exclusive, Sarajevo),
/salon-y (Gentlemen Tuzla), /salon-z (Mostar Fade Studio).
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
- Claude skriver ALDRIG in lösenord. Ägaren loggar in själv i admin i
  Claude-appens webbläsarpanel.
- En ny useState i admin-filen loggar ut ägaren under utveckling – säg
  till i förväg, återanvänd befintlig state när det går.
- Testa aldrig genom att spara/radera riktig data utan att fråga.
  Claude testar spara/radera genom att fånga upp databasanropen i
  webbläsaren (inget når Supabase).

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
  salons.salon_name). Byt inte salongsnamn direkt i Supabase.
- Kundtext som visas i mejl escapas (görs säker).
- Salongssidan visar bara tjänster som har en kategori (tomma
  kategorier och tjänster utan kategori syns inte för kunder).

============================================================
5. DESIGN
============================================================
Varumärkesfärg: #611a1a (maroon). Radera/destructive och fel: #ef4444.
Stil: vit, ren, professionell, rundade hörn, subtila kanter och skuggor.
Sidrubriker i bokningsflödet: svarta (#111827).
"Rezervacija potvrđena": vinröd. Felrutor i kort: vinröd ram, #fff7f7.
Fältfel i formulär: röd ram + röd text under fältet.

Typsnitt:
- DM Serif Display: stora rubriker (salongssidan m.m.)
- Source Sans 3: text, information, formulär
- Geist: knappar/UI
- Outfit: vissa boknings-/successrubriker, avbokningskortet
- Montserrat: startsidan – KATEGORIJE, SALONI och salongsnamnen på korten
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
beskrivning på bosniska, lang="bs".

============================================================
6. FILER OCH SIDOR
============================================================
Kundsidor:
/                  → app/page.tsx (startsida/katalog) – FRYST
/[salonSlug]       → app/[salonSlug]/page.tsx (salongssida) – FRYST
/times             → välja tid – FRYST
/podaci            → kunduppgifter – FRYST
/potvrda           → bekräfta bokning (bokningen skapas här) – FRYST
/uspjesno          → "Rezervacija potvrđena" – FRYST
/cancel            → avbokning via mejllänk (id + token) – FRYST
app/api/send-email/route.ts        → bokningsmejl – FRYST
app/api/send-cancel-email/route.ts → mejl när salongen avbokar i admin
Admin:
/admin/[salonSlug] → app/admin/[salonSlug]/page.tsx – omgjord i punkt 8
                     (ca 7 600 rader, en enda fil)
Övrigt:
components/SalonMap.tsx → kartan på startsidan – FRYST
app/layout.tsx → fliknamn, beskrivning, språk
app/globals.css → gemensam stil (påverkar ALLA sidor)
lib/supabase.ts → kopplingen till databasen
next.config.ts → allowedDevOrigins (datorns IP för test på mobil)

Dokument i rotmappen:
- CLAUDE.md – regler för Claude + "Var vi är nu"
- SALONIX-MASTER-CHECKPOINT.md – den här filen
- SALONIX-KARTA.md – trådarna mellan filerna + testlista efter ändringar

Filer som INTE används längre (ändra inte, ta inte bort utan att fråga):
app/salon-x-old, app/salon-y-old, app/salon-z-old,
app/admin/salon-*-old, app/booking. Filen "npm" i rotmappen är skräp.
⚠️ app/admin/page.tsx (/admin) är en GAMMAL adminsida som fortfarande är
aktiv – se avsnitt 12, punkt 10.

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
- Placering/bredd/överlapp/paus-räkning är ORÖRD.
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
- Placeringen och överlapp/paus-räkningen är ORÖRDA (se ovan för korten).
- Oanvänd state kvar: showBarberFilterMenu (kan tas bort senare).

Meddelanden (hela admin):
- showNotice(text, "success" | "error") → ruta överst. Grön 3 s, röd 6 s,
  × stänger. Ersätter alla alert() utom "Pogrešna lozinka" (inloggning,
  görs om i punkt 10).
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
OBS: Inloggningen gäller bara medan sidan är öppen – omladdning loggar ut.
Under utveckling loggas man också ut när en ny useState läggs till.
Admin hämtar notiser och bokningar automatiskt varje minut.

============================================================
8. SUPABASE – TABELLER
============================================================
salons: id, salon_name, slug, description, phone, address,
  opening_hours (text, t.ex. "09:00-18:00"), image_url, instagram_url,
  facebook_url, tiktok_url, closed_weekdays (text[], t.ex. ["Ned"]),
  hero_position, show_barbers, admin_password, city, categories (text[]),
  is_published (bool), latitude, longitude
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
Gentlemen Tuzla (id 2, /salon-y): en tjänst "Test", personal Suljo,
inga lediga tider just nu.

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
Ca 38 testsalonger (slug börjar med "test-") i 9 städer.
Behålls under punkt 8 och 9, tas bort i punkt 11 med:
delete from salons where slug like 'test-%';
Studio M har flera testbokningar (Nedim Z, Lamija, Ajdin, Adel M,
Almedin m.fl.), bl.a. två färgningar med en bokning under pausen
(tisdag 6 okt 11:00) – bra för att kontrollera att paus-dubbelbokning
visas rätt. En bokning söndag 4 okt fast söndag är stängd (gjord innan).
Studio M har också lediga tider på söndagar (gamla testdata).
Testtjänster: "test sisanje" (används av Claude vid test, data ändras
inte), "TEST"-namn m.fl.

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
8. Design/UX-kontroll av hela Salonix  🔄 NÄSTAN KLAR (kundsidor och
                                          admin klara; kvar: fliknamn +
                                          Montserrat på salongssidan)
9. Full QA inkl. edge cases .......... ⬜
10. Säkerhet och produktion .......... ⬜ (RLS, admininloggning,
    åtkomstkontroll, server-side validering, secrets)
11. Databas-/produktionsstädning ..... ⬜ (ta bort testsalonger m.m.)
12. Deploy till Vercel + salonix.ba .. ⬜
13. Slutligt smoke test i produktion . ⬜

============================================================
12. ATT KOMMA IHÅG (VIKTIGT)
============================================================
Punkt 9 (QA):
- /uspjesno visar "Potvrda rezervacije je poslana na email." även om
  mejlet misslyckades – kontrollera svaret från /api/send-email.
- Admin-kalendern: en bokning syns bara om dess tid matchar en rad i
  kalendern. Testa om bokningar försvinner när admin tar bort en dags
  lediga tider.
- Paus-dubbelbokningar: testa hela flödet (kund bokar under paus) och
  att kalendern visar dem rätt, mobil + desktop.
- Studio M har lediga tider på söndagar trots stängt – kontrollera att
  kunden inte kan boka då, och ta bort tiderna.
- Vad händer med tider (available_times) och bokningar när en person
  tas bort i Osoblje?
- Testa ALLA nya admin-delar på riktig iPhone (tidsfält, datumfält,
  bildväljare, beskärning med fingret, meddelanderutan, fråga-rutan,
  nya headern, Statistika-menyn i kortet, bokningsrutan, kalenderkorten
  med "2", att kalendern står kvar efter swipe + öppnad bokning).
- Testa avbokningsmejl från admin med riktig e-post (ägarens iCloud) och
  bokningsmejl i iPhone mörkt läge.
- Testa hela flödet med testlistan i SALONIX-KARTA.md (mobil + desktop).
Punkt 10 (säkerhet):
- salons.admin_password kan läsas av vem som helst med den publika
  Supabase-nyckeln. Admin jämför lösenordet i webbläsaren. Måste fixas.
- Gamla sidan /admin (app/admin/page.tsx) är aktiv med lösenordet
  admin123 i koden och visar ALLA salongers bokningar + kan radera.
  Stäng/ta bort den (fråga först).
- Admininloggningen ("Admin prijava") byggs om säkert OCH får Salonix-
  utseende samtidigt: logga, salongens namn, vinröd knapp, röd text vid
  fel lösenord (i stället för alert "Pogrešna lozinka"). Inloggningen
  ska överleva omladdning. (Ägarens beslut: görs i punkt 10.)
- Kundens namn/telefon/e-post skickas i webbadressen mellan sidorna.
- Personuppgifter: Bosniens lag om personuppgifter. Bekräftelse-sms/mejl
  = servicemeddelande; reklam kräver samtycke.
Punkt 12 (lansering):
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
- Kontrollera att "npm run build" fungerar (sidor med useSearchParams
  utan Suspense kan ge byggfel).
- allowedDevOrigins i next.config.ts gäller bara utveckling – påverkar
  inte Vercel.
Allmänt:
- Efter git pull på en ny dator: kör npm install.
- .env.local sparas inte i Git – måste kopieras manuellt.
- Gentlemen Tuzla och Mostar Fade: tjänster utan kategori syns inte på
  salongssidan – ägaren väljer kategori i admin.

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
14. NÄSTA STEG – PUNKT 8 (NÄSTAN KLAR)
============================================================
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
Allt ovan är sparat i Git (senaste commit: "Admin header: …").

ARBETSSÄTT SOM FUNGERADE (ägaren):
- Visa FLERA alternativ som bilder (mobil + desktop) – ägaren väljer,
  ofta en blandning. Ägaren vill ha det enkelt men tydligt.
- "Testa X så får vi se" = lägg in, visa, ägaren bestämmer behålla/ändra.
- Förslagsbilder görs som testfiler i scratchpad + en tillfällig lokal
  server (python3 -m http.server 8765), bilder skickas som filer.

NÄSTA – I DEN HÄR ORDNINGEN:
1. Salongssidan (förslaget är redan visat, vänta på "kör"):
   B) Eget fliknamn "Studio M Exclusive – Salonix" via NY fil
      app/[salonSlug]/layout.tsx (generateMetadata, hämtar salon_name
      från Supabase utifrån slug). Rör inte den frysta page.tsx.
      Öppen fråga till ägaren: ska salongens egen beskrivning användas
      som beskrivning (Google/WhatsApp/Viber) – ja eller nej?
   A) Salongsnamnet i Montserrat (600) på salongssidan: importera
      Montserrat i app/[salonSlug]/page.tsx (FRYST – ägaren måste säga
      "kör A") och byt bara h1:ans typsnitt. Färg/storlek oförändrade.
2. Punkt 9: full QA med testlistan i SALONIX-KARTA.md + listan i
   avsnitt 12 (paus-dubbelbokningar, söndagstider, borttagen personal,
   iPhone).
3. Punkt 10: säkerhet (fråga innan start).

============================================================
SLUT PÅ MASTER CHECKPOINT – 4 OKTOBER 2026
============================================================
