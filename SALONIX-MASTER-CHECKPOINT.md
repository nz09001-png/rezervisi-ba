============================================================
SALONIX – MASTER CHECKPOINT / PROJEKTSAMMANFATTNING
Senast uppdaterad: 3 oktober 2026
============================================================

VIKTIGT TILL NÄSTA CHATT:
Det här är den aktuella master-checkpointen för Salonix.
Punkt 1–7 i lanseringsplanen är KLARA och FRYSTA.
Nästa punkt är punkt 8: Design/UX-kontroll av hela Salonix.
Projektet har en fil CLAUDE.md i rotmappen med regler – läs den först.

============================================================
1. PROJEKTET
============================================================
Namn: SALONIX (tidigare Rezervisi.ba). Domän (planerad): salonix.ba
GitHub-repo heter fortfarande: rezervisi-ba (branch: termini-redesign)
Logga: "SALONIX" med slogan "BRŽE | LAKŠE | ONLINE".

Salonix är en SaaS-bokningsplattform (multi-salon) för salonger och
tjänsteföretag i Bosnien och Hercegovina, liknande Fresha/Bokadirekt.
Varje salong har en egen sida via slug, t.ex. /studio-m-exclusive.

============================================================
2. TEKNISK STACK
============================================================
- Next.js (App Router, version 16 – ny version, läs node_modules/next/dist/docs)
- React 19 + TypeScript
- Tailwind CSS + inline styles
- Supabase (databas)
- Resend (e-post)
- Leaflet + react-leaflet + OpenStreetMap (karta på startsidan)
- Git/GitHub, VS Code, Git Bash/Terminal
- Planerad hosting: Vercel
- Kodassistent: Claude Code (ändrar filer direkt, men frågar först)

============================================================
3. HUR VI ARBETAR (MYCKET VIKTIGT)
============================================================
- Ägaren är ny på programmering. Förklara på SVENSKA, enkelt, steg för steg.
- All text som användare ser ska vara på BOSNISKA.
- En ändring i taget. Ägaren testar och godkänner innan nästa steg.
- Fråga innan filer ändras eller skapas.
- Databasändringar (Supabase) föreslås som SQL och godkänns först.
  Ägaren kör SQL själv i Supabase → SQL Editor → New query → Run.
- Fungerande + godkänd kod/design = FRYST. Ändra inte frysta delar
  utan att fråga först.
- Mobil och desktop hålls isär (isMobile / isDesktop / isTablet).
  En ändring på ena får inte påverka den andra.
- Git-kommandon ges i ETT kopierbart block:
  git add ... && git commit -m "..." && git push
- Ha inte samma fil öppen och osparad i VS Code medan Claude ändrar den
  (annars "The content of the file is newer" – klicka då INTE på Overwrite,
  välj "Don't Save").

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
- Byt inte det globala typsnittet i globals.css.

============================================================
5. DESIGN
============================================================
Varumärkesfärg: #611a1a (maroon). Radera/destructive: #ef4444.
Stil: vit, ren, professionell, rundade hörn, subtila kanter och skuggor.

Typsnitt:
- DM Serif Display: stora rubriker (salongssidan m.m.)
- Source Sans 3: text, information, formulär
- Geist: knappar/UI
- Outfit: vissa boknings-/successrubriker
- Montserrat: på startsidan – sektionsrubrikerna KATEGORIJE och SALONI
  (versaler, luft mellan bokstäverna, vinröd) och salongsnamnen på korten

Loggor i public/:
- salonix-horisontell-maroon.png – liggande logga, vinröd
- salonix-logo-ljus.png – stående logga med slogan, krämvit utan
  bakgrund (för vinröd bakgrund på desktop)

Fliknamn i webbläsaren (app/layout.tsx):
- Titel: "Salonix – Rezervišite termin online"
- Beskrivning på bosniska, språk lang="bs"

============================================================
6. FILER OCH SIDOR
============================================================
Kundsidor:
/                  → app/page.tsx (startsida/katalog) – FRYST
/[salonSlug]       → app/[salonSlug]/page.tsx (salongssida) – FRYST
/times             → välja tid – FRYST
/podaci            → kunduppgifter – FRYST
/potvrda           → bekräfta bokning – FRYST
/uspjesno          → bokning klar – FRYST
/cancel            → avbokning – FRYST
app/api/send-email/route.ts → bokningsmejl – FRYST
Admin:
/admin/[salonSlug] → app/admin/[salonSlug]/page.tsx – FRYST
Övrigt:
components/SalonMap.tsx → kartan på startsidan – FRYST
app/layout.tsx → fliknamn, beskrivning, språk

Filer som INTE används längre (ändra inte, ta inte bort utan att fråga):
app/salon-x-old, app/salon-y-old, app/salon-z-old,
app/admin/salon-*-old, app/booking

Bokningsflödet: SALONG → TJÄNST → PERSONAL → TID → UPPGIFTER → BEKRÄFTA
→ BOKNING SKAPAS → EMAIL → SUCCESS. Avbokning via /cancel (id + cancel_token).

============================================================
7. ADMINPANELEN (KLAR, FRYST)
============================================================
Header (Odjavi se, Obavijesti, Postavke), statistik (Danas/Ova sedmica/
Ovaj mjesec/Datum), veckokalender med personalfilter och färger,
bokningspopup (Otkaži klijenta), notiser, Postavke: Naslovna slika
(cropper), Galerija, Informacije o salonu (adress, öppettider, sociala
länkar, Neradni dani, Skraćeno radno vrijeme), Kategorije usluga,
Usluge (med multi-step "Koraci tretmana"), Termini (Posebni/Standardni),
Osoblje, Zatvoreni dani.
OBS: Adminpanelen sparar inte koordinater, stad eller kategorier –
de sätts i Supabase.

============================================================
8. SUPABASE – TABELLER
============================================================
salons: id, salon_name, slug, description, phone, address,
  opening_hours (text, t.ex. "09:00-18:00"), image_url, instagram_url,
  facebook_url, tiktok_url, closed_weekdays (text[], t.ex. ["Ned"]),
  hero_position, show_barbers, admin_password,
  NYTT: city, categories (text[]), is_published (bool),
  latitude, longitude
services, service_steps, barbers (= personal), service_barbers,
available_times, bookings, admin_notifications, closed_days
(salong eller person, per datum), salon_shortened_hours
(salon_id, weekday, start_time, end_time).

Kategorier (måste stämma EXAKT med salons.categories):
Frizura, Barber, Nokti, Trepavice i obrve, Depilacija, Masaža,
Njega lica, Solarijum   ("Ljepota" är borttagen.)

Koordinater: räknas fram från adressen en gång (geokodning via
OpenStreetMap) och sparas med SQL. Nya salonger måste få koordinater
manuellt tills vidare.

Studio M Exclusive (id 1): adress Kranjčevićeva 15, Sarajevo,
koordinater 43.858024, 18.404882. Öppettider 09:00–18:00 (rättat),
Subota 10:00–15:00 (förkortad), Nedjelja stängd.

============================================================
9. STARTSIDAN (PUNKT 6 + 7 – KLAR OCH FRYST)
============================================================
Skärmstorlekar (känns av i app/page.tsx):
- Mobil: under 600 px (standard)
- Surfplatta: 600–1023 px – som mobil, men salonger 2 per rad
- Desktop: från 1024 px

Mobil:
- Liggande logga överst
- Vinröd topp: "Sve za vašu ljepotu", sökfält, stadsval "Svi gradovi"
- KATEGORIJE: 8 stora bildkort, 2 per rad (bilder i public/categories/)
- SALONI: knapp "Karta"/"Lista"
- Knapprad (scrollar i sidled): Preporučeno, Novi saloni,
  Najbliže meni (ordning – en åt gången, vinröd) + Otvoreno danas (filter, grön)
- Etiketter för valt (stad, kategori, sökord) med ✕ och "Očisti sve"
- Salongskort: bild med kategorietikett, namn (Montserrat), adress
  (+ avstånd), "Otvoreno danas · tider" (grön) / "Zatvoreno danas" (grå), pil
- Vit list som följer med vid scroll: ikon, ☰ (kategoripanel från
  vänster med små ikoner), sökfält
- Sidfot: logga, text, © Salonix · salonix.ba

Desktop:
- Innehåll centrerat, max 1200 px
- Vinröd topp med stående krämvit logga + slogan, "Sve za vašu ljepotu",
  sökrad i EN rad: sök | stad | knappen "Pretraži"
- Kategorier 2 per rad med höga kort (280 px)
- Salonger 3 per rad
- Vit list: hel logga, "☰ Kategorije", sökfält
- Större karta, sidfot på en rad

Logik:
- Sök: namn, stad, adress, kategorier (okänsligt för č, ć, š, ž, đ)
- Stad: hämtas automatiskt från salongerna, sparas i kundens
  webbläsare (localStorage)
- Antal salonger visas BARA när en stad är vald, aldrig totalt
- Preporučeno: poäng (öppet idag +3, bild +1, öppettider +1, adress +1),
  samma poäng roteras dagligen (rättvist)
- Novi saloni: högst id först
- Najbliže meni: frågar efter kundens plats (sparas inte). Nekar
  kunden → kartan öppnas med hela Bosnien
- Otvoreno danas: stängd dag (closed_days / closed_weekdays) går före
  förkortade tider, som går före vanliga öppettider. Salonger utan
  öppettider räknas inte som öppna
- Klick på kategori/stad scrollar ner till salongerna
- Karta: Leaflet + OpenStreetMap, vinröda nålar, popup med "Rezerviši"

============================================================
10. TESTDATA
============================================================
Ca 38 testsalonger (slug börjar med "test-") i 9 städer.
De behålls under punkt 8 och 9 och tas bort i punkt 11 med:
delete from salons where slug like 'test-%';

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
8. Design/UX-kontroll av hela Salonix  ⏭️ NÄSTA
9. Full QA inkl. edge cases .......... ⬜
10. Säkerhet och produktion .......... ⬜ (RLS, admininloggning,
    åtkomstkontroll, server-side validering, secrets)
11. Databas-/produktionsstädning ..... ⬜ (ta bort testsalonger m.m.)
12. Deploy till Vercel + salonix.ba .. ⬜
13. Slutligt smoke test i produktion . ⬜

============================================================
12. ATT KOMMA IHÅG (VIKTIGT)
============================================================
Punkt 10 (säkerhet):
- salons.admin_password kan läsas av vem som helst med den publika
  Supabase-nyckeln. Måste fixas.
Punkt 12 (lansering):
- Byt OpenStreetMaps kartbilder mot en leverantör med gratisnivå
  (t.ex. MapTiler).
- public/categories/solarijum.jpg kommer från Pinterest – måste bytas
  mot en bild ni har rätt att använda. Övriga kategoribilder är från
  Unsplash (fria).
- "Najbliže meni" (plats) fungerar bara på https (salonix.ba) eller
  localhost – inte på mobil via wifi under utveckling.
- Bokningsmejl: koppla salonix.ba till Resend och byt avsändare från
  onboarding@resend.dev. I testläge når mejlen bara Resend-kontots egen adress.
- Bokningsmejl: byt texten "SALONIX" överst mot loggan som bild
  (https://salonix.ba/salonix-horisontell-maroon.png) när sidan ligger ute.
- Bekräftelse-sms från Salonix (Salonix skickar, inte salongerna):
  kräver företag, sms-tjänst (t.ex. Infobip/Twilio) och avsändar-ID "Salonix".
  Byggs efter deploy. Ändra då texten under Telefon på /podaci till t.ex.
  "Na ovaj broj ćete dobiti SMS potvrdu rezervacije."
  (Påminnelser före bokningen kräver dessutom ett schemalagt jobb.)
Punkt 9 (QA):
- /uspjesno visar "Potvrda rezervacije je poslana na email." även om
  mejlet misslyckades – kontrollera svaret från /api/send-email.
- Efter git pull på en ny dator: kör npm install (Leaflet lades till).
- .env.local sparas inte i Git – måste kopieras manuellt.

============================================================
13. IDÉER TILL SENARE
============================================================
- "Najpopularnije" (efter riktiga bokningar, via säker databasfunktion)
- "Prvi slobodan termin" (efter QA, med samma regler som /times)
- Etikett "Istaknuto" för salonger som betalar för synlighet
- Etikett "Novo" (kräver datumkolumn i salons)
- Admin: stad, kategorier och koordinater automatiskt från adressen
- Salongssidan: salongsnamn i Montserrat, eget fliknamn per salong
  (t.ex. "Studio M Exclusive – Salonix")
- "Za salone – registrujte svoj salon" i sidfoten (behöver kontaktuppgift)

============================================================
14. NÄSTA STEG – PUNKT 8
============================================================
1. Gå igenom ALLA sidor (startsida, salongssida, bokningsflöde,
   avbokning, admin) på mobil och desktop.
2. Gör en lista över det som inte hänger ihop (typsnitt, färger,
   knappar, texter) och det som kan förvirra kunden.
3. Ägaren väljer vad som ska fixas – frysta sidor ändras bara med ja.

Arbetssätt: läs SALONIX-KARTA.md först. Visa buggen (mobil + desktop)
före ändringen, ändra efter ja, visa resultatet, ge Git-kommando och
lista de kommande stegen.

KLART i punkt 8 (3 oktober 2026):
- Salongssidan mobil: Rezerviši syns även när personal är dold
  (till höger i kortet, går ner en rad vid lång text).
- Mörkt läge borttaget i globals.css (alltid ljus design).
- "← Nazad" på /podaci kommer ihåg vald personal (barberId).
- Svensk text → bosniska (laddning, kalenderfil i mejlet, admin-felruta).
- Fel salongsadress: sidan "Salon nije pronađen" + "Nazad na početnu".
- Telefontexten på /podaci lovar inte längre påminnelser.
- Valuta: KM överallt.
- Datum: 10.10.2026 (utan punkt) överallt, även i mejlet.
- Ni-form i rubriker och instruktioner ("Odaberite termin", "Unesite podatke",
  admin "Izaberite..."). Korta knappar (Rezerviši, Sačuvaj, Dodaj, Obriši)
  behåller du-form med flit.
- Rubrikfärger: sidrubriker svarta (#111827), även "Pregled rezervacije"
  på desktop. "Rezervacija potvrđena" vinröd. Cancel-sidans kortrubriker
  får vara kvar svarta (ägarens val).
- Avbokningsknappen på /cancel: 16 px rundning och fet text.
- /uspjesno utan e-post: "Za otkazivanje termina kontaktirajte salon."
  (ägaren vill INTE visa salongens telefonnummer där). Avbokningslänk i
  sms kan komma efter punkt 12.
- Beslut: /cancel behöver inte visa bokningen – uppgifterna står i mejlet
  där avbokningslänken finns.
- /podaci: inga grå alert-rutor. Fel visas som röd ram (#ef4444) + röd text
  under fältet (ägarens val "C"). Samma kontroller som förut.
- /potvrda: inga grå alert-rutor. Fel visas i en vinröd ruta i kortet
  (samma stil som "Termin je upravo rezervisan"). Tidsfel → knappen
  "Odaberite drugi termin" (till /times med samma tjänst och person).
  Tekniska fel → "Došlo je do greške" + "Završi rezervaciju" står kvar.
- /cancel: inga grå rutor. "Otkaži rezervaciju" → frågan i kortet med
  "Da, otkaži" / "Ne". Fel i vinröd ruta: "Rezervacija nije pronađena"
  (ingen knapp) eller "Došlo je do greške" (knappen står kvar).
  Kvar med alert(): bara admin (ca 74 st).
- /times: vecka utan lediga tider visar "Nema slobodnih termina ove sedmice"
  + "Sljedeća sedmica →" (mobil: under kalendern, desktop: mitt i den).
  Räknar bara synliga tidsknappar – tidsreglerna är orörda.
- Salongssidan: telefonnumret är en ringlänk (tel:), samma utseende.
  Ingen egen bekräftelseruta – telefonen frågar själv (ägarens val).
- Salongssidan: öppettider visas med långt streck (09:00–18:00), som
  startsidan och de förkortade tiderna. Databasen oförändrad.
- Salongssidan: galleripilar bara vid fler än 2 bilder; i helskärm bara
  vid fler än 1 bild.
- Salongssidan: vit list överst med Salonix-loggan (länk till startsidan),
  desktop även "← Svi saloni". Sidfot som startsidan: logga (länk),
  "Pronađite još salona i rezervišite termin online.", © Salonix.
  Ingen knapp "Pogledajte sve salone" (ägarens val).
- Etiketten "SALON" ovanför salongsnamnet behålls som den är (ägarens val).
- Bokningsmejlet (alternativ A): "SALONIX" i text överst, vitt kort på
  beige, "Rezervacija potvrđena", hälsning med förnamn, Salon/Usluga/
  Osoblje/Datum/Vrijeme (+ Trajanje och Cijena om salongen visar dem),
  kalenderrad, "Otkaži rezervaciju", sidfot. Ämne: "Rezervacija potvrđena –
  [salong], [datum] u [tid]". /potvrda skickar med customerFirstName,
  staff, price, showDuration. Kundtext escapas. Kalenderfil och
  avbokningslänk orörda. Mejlet har "color-scheme: light only" så att
  iPhones Mail inte gör om det till mörka färger i mörkt läge.

ADMIN-GENOMGÅNG (punkt 8, pågår). Ägaren loggar in själv i Claude-appens
webbläsarpanel (Claude skriver aldrig lösenord). Inloggningen försvinner
vid omladdning – ladda inte om sidan under genomgången.
REGEL: Kalendern i admin (mobil OCH desktop) rörs INTE – den tas absolut
sist. Ändringar i resten av admin får inte påverka kalendern.
Klart i admin:
- Mobil: knapparnas ordning Postavke → Obavijesti → Odjavi se (CSS order).
  Desktop oförändrad.
- Statistikrutan: siffran vinröd som "Današnje rezervacije". Etiketten
  följer filtret: "Sve rezervacije" / "Rezervacije danas" / "Rezervacije
  ove sedmice" / "Rezervacije ovog mjeseca" / "Rezervacije [datum]".
- Statistiken räknar rätt: "Danas" i lokal tid (även "Današnje
  rezervacije"), "Ova sedmica" = måndag–söndag (även på söndagar),
  "Ovaj mjesec" = hela månaden. Ändringen rör bara statistiken, inte kalendern.
Ordning för resten av admin (ägarens val): bokningsrutan → Salonix-typsnitt
(kalendern låst vid Arial) → Obavijesti → Postavke → kalendern sist.

KVAR i punkt 8 (i den här ordningen):
1. Resten av listan: admin-stavfel ("Osooblje", "Osobolje", "Edit", "Ime Osoblja").

Ägaren gör själv i admin: tjänster utan kategori hos Gentlemen Tuzla
och Mostar Fade syns inte förrän de får en kategori.

Säkerhet (punkt 10): gamla sidan /admin (app/admin/page.tsx) är aktiv
med lösenordet admin123 och visar alla salongers bokningar – stäng den.
Punkt 10: admininloggningen ("Admin prijava") byggs om säkert OCH får
Salonix-utseende samtidigt (logga, salongens namn, vinröd knapp, röd text
vid fel lösenord i stället för grå ruta). Ägarens beslut: inte i punkt 8.

============================================================
SLUT PÅ MASTER CHECKPOINT – 3 OKTOBER 2026
============================================================
