============================================================
SALONIX – MASTER CHECKPOINT / PROJEKTSAMMANFATTNING
Senast uppdaterad: 3 oktober 2026 (kväll)
============================================================

VIKTIGT TILL NÄSTA CHATT:
Det här är den aktuella master-checkpointen för Salonix.
Punkt 1–7 i lanseringsplanen är KLARA och FRYSTA.
Vi är MITT I punkt 8: Design/UX-kontroll av hela Salonix.
- Kundsidorna (startsida, salongssida, bokningsflöde, avbokning, mejl)
  är genomgångna och fixade.
- Admin gås igenom nu. Nästa beslut: förslaget "Postavke som egen sida"
  (se avsnitt 14).
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
- Tailwind CSS + inline styles
- Supabase (databas)
- Resend (e-post)
- Leaflet + react-leaflet + OpenStreetMap (karta på startsidan)
- libphonenumber-js (telefonkontroll), react-datepicker, react-easy-crop (admin)
- Git/GitHub, VS Code, Terminal
- Planerad hosting: Vercel
- Kodassistent: Claude Code i Claude-appen (ändrar filer direkt, men frågar
  först). Claude har en egen webbläsarpanel i appen där den tar skärmbilder
  på mobil och desktop.

============================================================
3. HUR VI ARBETAR (MYCKET VIKTIGT)
============================================================
- Ägaren är ny på programmering. Förklara på SVENSKA, enkelt, steg för steg.
- All text som användare ser ska vara på BOSNISKA.
- En ändring i taget. Ägaren testar och godkänner innan nästa steg.
- Fråga innan filer ändras eller skapas.
- Inför VARJE ändring:
  1. Läs SALONIX-KARTA.md (vilka "trådar" berörs?).
  2. Visa buggen/nuläget med skärmbilder på MOBIL och DESKTOP.
  3. Visa planen (fil, vad som ändras, vad som INTE ändras).
     Vid designval: gör en tillfällig förhandsvisning i webbläsaren
     (ändrar ingen fil) och låt ägaren välja.
  4. Ändra efter ägarens ja.
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
  Claude-appens webbläsarpanel (inte i sin egen Safari/telefon).

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
- Byt inte det globala typsnittet i globals.css.
- Mörkt läge är borttaget i globals.css – Salonix är alltid ljust.
- ADMIN-KALENDERN (mobil OCH desktop) rörs INTE förrän allra sist i
  admin-genomgången. Andra admin-ändringar får inte påverka den.
- Bokningar kopplas till salong via salongens NAMN (bookings.salon =
  salons.salon_name). Byt inte salongsnamn direkt i Supabase.
- Kundtext som visas i mejl escapas (görs säker).

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
app/api/send-cancel-email/route.ts → NY: mejl när salongen avbokar i admin
Admin:
/admin/[salonSlug] → app/admin/[salonSlug]/page.tsx – genomgång pågår
Övrigt:
components/SalonMap.tsx → kartan på startsidan – FRYST
app/layout.tsx → fliknamn, beskrivning, språk
app/globals.css → gemensam stil (påverkar ALLA sidor)
lib/supabase.ts → kopplingen till databasen

Dokument i rotmappen:
- CLAUDE.md – regler för Claude
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
Header (desktop: Postavke, Obavijesti, Odjavi se; mobil: samma ordning
uppifrån), statistik (Današnje rezervacije + ruta som följer filtret
under "Statistika": Danas/Ova sedmica/Ovaj mjesec/Datum), veckokalender
med personalfilter och färger, bokningsruta, Obavijesti, Postavke:
Naslovna slika (cropper), Galerija, Informacije o salonu (beskrivning,
telefon, adress, öppettider, Neradni dani, Skraćeno radno vrijeme,
sociala länkar), Kategorije usluga, Usluge (med "Koraci tretmana"),
Termini (Posebni/Standardni), Osoblje (+ "Prikaži osoblje na stranici"),
Zatvoreni dani.
OBS: Admin sparar inte koordinater, stad eller kategorier – sätts i Supabase.
OBS: Inloggningen gäller bara medan sidan är öppen – omladdning loggar ut.
Under utveckling loggas man också ut när Claude lägger till nya
funktioner (hooks) i admin-filen. Admin hämtar notiser och bokningar
automatiskt varje minut, så man behöver inte ladda om.

============================================================
8. SUPABASE – TABELLER
============================================================
salons: id, salon_name, slug, description, phone, address,
  opening_hours (text, t.ex. "09:00-18:00"), image_url, instagram_url,
  facebook_url, tiktok_url, closed_weekdays (text[], t.ex. ["Ned"]),
  hero_position, show_barbers, admin_password, city, categories (text[]),
  is_published (bool), latitude, longitude
services (salon_id, name, description, price, duration_minutes,
  show_price, show_duration, category_id), service_categories,
service_steps, barbers (= personal), service_barbers, available_times,
bookings (customer_name, phone, email, note, salon [= salongsnamn],
  booking_date, booking_time, service, service_id, duration_minutes,
  barber_name, barber_id, cancel_token, created_at),
admin_notifications (salon_id, type, title, message, event_date,
  event_time, is_read, created_at), closed_days (salong eller person,
  per datum), salon_shortened_hours (salon_id, weekday, start_time,
  end_time), salon_images.

Notisernas message: nya sparas som två rader "Namn\n05.10.2026 u 09:00 ·
Personal" (admin visar namnet fetstilt). Gamla är en hel mening.

Kategorier (måste stämma EXAKT med salons.categories):
Frizura, Barber, Nokti, Trepavice i obrve, Depilacija, Masaža,
Njega lica, Solarijum

Koordinater: räknas fram från adressen en gång och sparas med SQL.
Nya salonger måste få koordinater manuellt tills vidare.

Studio M Exclusive (id 1, /salon-x): Kranjčevićeva 15, Sarajevo,
koordinater 43.858024, 18.404882. Öppettider 09:00–18:00,
Subota 10:00–15:00 (förkortad), Nedjelja stängd. Telefon 033875-600.
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
Studio M har flera testbokningar (Nedim Z, Lamija Test m.fl.), bl.a. en
bokning söndag 4 okt fast söndag är stängd (gjord innan) – kan avbokas.

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
8. Design/UX-kontroll av hela Salonix  🔄 PÅGÅR (kundsidor klara,
                                          admin pågår)
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
- Testa hela flödet med testlistan i SALONIX-KARTA.md (mobil + desktop).
Punkt 10 (säkerhet):
- salons.admin_password kan läsas av vem som helst med den publika
  Supabase-nyckeln. Admin jämför lösenordet i webbläsaren. Måste fixas.
- Gamla sidan /admin (app/admin/page.tsx) är aktiv med lösenordet
  admin123 i koden och visar ALLA salongers bokningar + kan radera.
  Stäng/ta bort den (fråga först).
- Admininloggningen ("Admin prijava") byggs om säkert OCH får Salonix-
  utseende samtidigt: logga, salongens namn, vinröd knapp, röd text vid
  fel lösenord. Inloggningen ska överleva omladdning. (Ägarens beslut:
  görs i punkt 10, inte i punkt 8.)
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
- Salongssidan: salongsnamn i Montserrat, eget fliknamn per salong
  (t.ex. "Studio M Exclusive – Salonix")
- "Za salone – registrujte svoj salon" i sidfoten (behöver kontaktuppgift)
- Admin: klick på en notis → hoppa till rätt vecka i kalendern (görs när
  kalendern gås igenom)

============================================================
14. NÄSTA STEG – PUNKT 8 (PÅGÅR)
============================================================
KLART i punkt 8 – kundsidor och mejl:
- Salongssidan mobil: "Rezerviši" syns även när personal är dold (till
  höger i kortet, går ner en rad vid lång text, alltid högerkant).
- Mörkt läge borttaget i globals.css (alltid ljus design).
- "← Nazad" på /podaci kommer ihåg vald personal (barberId).
- Svensk text → bosniska (laddning, kalenderfil, admin-felruta).
- Fel salongsadress: sidan "Salon nije pronađen" + "Nazad na početnu".
  Laddning: "Učitava se..." centrerat.
- Telefontexten på /podaci: "Salon će vas kontaktirati na ovaj broj ako
  bude potrebno." (lovar inte påminnelser).
- KM överallt. Datum 10.10.2026 överallt (även mejl och notiser).
- Ni-form i rubriker/instruktioner (även admin "Izaberite...").
- Rubrikfärger: sidrubriker svarta, även "Pregled rezervacije" på desktop.
  "Rezervacija potvrđena" vinröd. /cancel-kortets rubriker svarta (val).
- /cancel: knappen 16 px rundning + fet. Frågan "Da, otkaži"/"Ne" i kortet,
  fel i vinröd ruta ("Rezervacija nije pronađena" / "Došlo je do greške").
  Behöver inte visa bokningen (står i mejlet – ägarens beslut).
- /uspjesno utan e-post: grå text "Za otkazivanje termina kontaktirajte
  salon." (inget telefonnummer – ägarens val).
- /podaci: fel visas som röd ram + röd text under fältet (inga alert).
- /potvrda: fel i vinröd ruta i kortet. Tidsfel → "Odaberite drugi
  termin" (till /times). Tekniska fel → "Došlo je do greške", knappen
  "Završi rezervaciju" står kvar.
- /times: vecka utan lediga tider → "Nema slobodnih termina ove sedmice"
  + "Sljedeća sedmica →" (mobil under kalendern, desktop mitt i den).
- Salongssidan: telefon = ringlänk (telefonen frågar själv), öppettider
  med långt streck, galleripilar bara vid > 2 bilder (helskärm > 1),
  vit list överst med Salonix-logga (+ "← Svi saloni" på desktop),
  sidfot som startsidan (utan knapp "Pogledajte sve salone").
  Etiketten "SALON" behålls.
- Bokningsmejl (alternativ A): "SALONIX" överst, vitt kort på beige,
  "Rezervacija potvrđena", hälsning med förnamn, Salon/Usluga/Osoblje/
  Datum/Vrijeme (+ Trajanje/Cijena om salongen visar dem), kalenderrad,
  "Otkaži rezervaciju", sidfot. Ämne "Rezervacija potvrđena – [salong],
  [datum] u [tid]". "color-scheme: light only" (iPhone mörkt läge testat –
  gjordes om till ljust; nya mejl ska nu vara ljusa).

KLART i punkt 8 – admin:
- Mobil: knappordning Postavke → Obavijesti → Odjavi se. Desktop orörd.
- Statistik: vinröd siffra, etikett som följer filtret ("Sve rezervacije",
  "Rezervacije danas/ove sedmice/ovog mjeseca/[datum]"). Räknar rätt:
  lokal tid, vecka mån–sön (även söndag), hela månaden.
- Bokningsrutan: två kolumner, "Trajanje: 60 min", klickbar telefon och
  e-post, knappen "Otkaži rezervaciju" med frågan "Da, otkaži"/"Ne" i
  rutan, fel i rutan, stängs med ×/klick utanför/Esc.
- Avbokning i admin → mejl "Rezervacija otkazana" till kunden (om e-post)
  via app/api/send-cancel-email/route.ts. (Ej testat med riktigt mejl än.)
- Obavijesti: "Označi sve kao pročitano", tid ("prije 9 min"), nya
  notiser med namnet fetstilt på egen rad (testat – fungerar).
- Admin hämtar notiser + bokningar automatiskt varje minut (testat).
- Beslut: admin behåller typsnittet Arial.

ÄGAREN BEHÖVER TESTA / SPARA I GIT:
- Avbokning i admin med en testbokning som har ägarens iCloud-adress →
  kommer mejlet "Rezervacija otkazana" fram och är det ljust?
- Nytt bokningsmejl i iPhone med mörkt läge → är det ljust nu?
- Spara allt i Git (se kommandot som gavs vid checkpointen).

NÄSTA – ADMIN, I DEN HÄR ORDNINGEN:
1. POSTAVKE SOM EGEN SIDA (förslag, väntar på ägarens ja):
   - "Postavke" öppnar en helsidesvy OVANPÅ kalendern (kalendern orörd):
     "← Nazad na kalendar", rubrik "Postavke", "Šta želite promijeniti?"
     och stora rutor (ikon + namn + förklaring), 2 per rad desktop,
     1 per rad mobil:
       🗓️ Slobodni termini – Kada klijenti mogu rezervisati
       🚫 Zatvoreni dani – Godišnji odmor, praznici, bolovanje
       ✂️ Usluge – Usluge, cijene i trajanje
       📂 Kategorije usluga – Grupe usluga, npr. Šišanje, Brada
       👥 Osoblje – Ko radi u salonu
       ℹ️ Informacije o salonu – Adresa, telefon, radno vrijeme, opis
       🖼️ Naslovna slika – Velika slika na vrhu stranice salona
       📷 Galerija – Slike salona
   - Tryck på en ruta → bara det avsnittet, med "← Nazad na postavke".
     Ett avsnitt i taget (i dag staplas de ovanför kalendern och stängs
     bara genom att välja dem igen i menyn).
   - Innehållet i avsnitten oförändrat i det steget.
   - Ägaren kan vilja ändra namn/förklaringar/ordning.
2. Gå igenom varje Postavke-avsnitt (mobil + desktop) och förenkla:
   förklarande texter, större knappar, grå alert-rutor (ca 74 i admin)
   → tydliga meddelanden, stavfel: "Edit" → "Uredi" (Usluge),
   "Ime Osoblja" → "Ime člana osoblja" (Osoblje), "Osobolje" (Zatvoreni dani).
3. KALENDERN – allra sist (mobil + desktop): stavfelet "Osooblje" på
   filterknappen (desktop), klick på notis → rätt vecka, m.m.
4. Därefter: punkt 9 (full QA) med testlistan i SALONIX-KARTA.md.

============================================================
SLUT PÅ MASTER CHECKPOINT – 3 OKTOBER 2026
============================================================
