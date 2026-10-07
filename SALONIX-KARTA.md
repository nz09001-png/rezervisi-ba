# SALONIX – KARTA ÖVER HUR FILERNA HÄNGER IHOP

Senast uppdaterad: 7 oktober 2026

Läs den här filen **innan varje ändring**. Den visar de "osynliga trådarna"
mellan filerna: om man ändrar på ett ställe måste man komma ihåg det andra.
Efter varje ändring körs **testlistan** längst ner.

---

## Filerna som används

| Sida / fil | Adress | Vad den gör |
|---|---|---|
| `app/page.tsx` | `/` | Startsida/katalog (FRYST) |
| `components/SalonMap.tsx` | – | Kartan på startsidan (FRYST) |
| `app/[salonSlug]/page.tsx` | `/salon-x` m.fl. | Salongssidan (FRYST) |
| `app/times/page.tsx` | `/times` | Välja tid (FRYST) |
| `app/podaci/page.tsx` | `/podaci` | Kundens uppgifter (FRYST) |
| `app/potvrda/page.tsx` | `/potvrda` | Bekräfta – här skapas bokningen (FRYST) |
| `app/uspjesno/page.tsx` | `/uspjesno` | "Rezervacija potvrđena" (FRYST) |
| `app/cancel/page.tsx` | `/cancel` | Avbokning via länk i mejlet (FRYST) |
| `app/api/send-email/route.ts` | – | Skickar bokningsmejlet (FRYST) |
| `app/admin/[salonSlug]/page.tsx` | `/admin/salon-x` m.fl. | Adminpanelen (FRYST) |
| `app/admin/page.tsx` | `/admin` | ⚠️ GAMMAL adminsida, fortfarande aktiv (se nedan) |
| `app/layout.tsx` | alla sidor | Fliknamn, beskrivning, språk |
| `app/globals.css` | alla sidor | Gemensam stil (påverkar ALLT) |
| `lib/supabase.ts` | alla sidor | Kopplingen till databasen |

Enda salongen just nu: `/salon-x` (Studio M Exclusive). Testsalonger, `/salon-y` och
`/salon-z` raderades i punkt 11.

Gamla filer som inte används (ändra inte, ta inte bort utan att fråga):
`app/salon-x-old`, `app/salon-y-old`, `app/salon-z-old`, `app/admin/salon-*-old`, `app/booking`.
Filen `npm` i rotmappen är skräp från en felskriven kommandorad.

---

## De osynliga trådarna

### Tråd 1 – Bokningsflödet skickar data i webbadressen
Salong → `/times` → `/podaci` → `/potvrda` → `/uspjesno`.
Varje sida lämnar vidare en "stafettpinne" i adressen:
`salon` (salongens namn), `salonSlug`, `serviceId`, `barberId`, `date`, `time`
(`/uspjesno` får dessutom `service`, `barber`, `price`, `duration`, `showPrice`, `showDuration`).
**Kundens uppgifter ligger INTE i adressen** (sedan punkt 10): `/podaci` sparar
`ime`, `prezime`, `phoneCode`, `phone`, `normalizedPhone`, `email`, `napomena` i
flikens minne (sessionStorage) via `lib/customerData.ts`. `/potvrda` och `/uspjesno`
läser därifrån, och `/podaci` fyller i fälten därifrån. Saknas uppgifterna (t.ex. ny
flik) skickar `/potvrda` kunden till `/podaci`.
**Risk:** byter man namn på något av dessa på en sida blir nästa sida tom eller fel.
Även "← Nazad"-länkarna måste skicka med rätt delar (t.ex. `barberId`).
Bakåt: `/potvrda` → `/podaci` ("Promijeni", "← Nazad") och `/potvrda` → `/times`
("Promijeni" i TERMIN, felrutan) skickar `date`/`time`. `/times` läser `date`/`time`
(rätt vecka, tiden förvald). Kundens uppgifter följer med via flikens minne.

### Tråd 2 – Bokningar hittar sin salong via salongens NAMN
`bookings.salon` = `salons.salon_name` (inte id-nummer).
Används i: salongssidan, `/times`, `/potvrda`, `/cancel`, adminpanelen – och sedan
punkt 10 även i databasen: funktionerna `get_booked_slots` / `create_booking` och
RLS-regeln för `bookings` (ägaren hittas via `salons.salon_name`).
**Risk:** ändras ett salongsnamn i Supabase försvinner gamla bokningar ur admin
och dubbelbokningar blir möjliga. Två salonger med exakt samma namn delar bokningar.
(Admin kan inte ändra namnet – risken finns bara om man ändrar direkt i Supabase.)

### Tråd 3 – Reglerna för lediga tider finns i TRE kopior
1. `/times` – visar lediga tider.
2. `/potvrda` – kontrollerar allt igen och väljer personal vid "Bez preferencije".
3. Admin-kalendern – visar bokningar och flerstegstjänster.
(Startsidan har en enklare egen variant för "Otvoreno danas".)
Reglerna: `service_barbers`, `available_times`, `closed_days` (salong eller person),
`closed_weekdays`, `salon_shortened_hours`, `service_steps` (Koraci tretmana).
**Risk:** ändras en regel på ett ställe måste den ändras på alla. Rör inte under design-arbete.

### Tråd 4 – Veckodagarna skrivs "Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"
Används i databasen (`closed_weekdays`, `salon_shortened_hours.weekday`) och i
startsidan, salongssidan, `/times` och adminpanelen.
**Risk:** stavningen måste vara exakt likadan överallt (även "Č").

### Tråd 5 – Kategorinamnen
Startsidans kategorier måste stämma exakt med `salons.categories` i Supabase:
Frizura, Barber, Nokti, Trepavice i obrve, Depilacija, Masaža, Njega lica, Solarijum.

### Tråd 6 – Mejlet och avbokningen
`/potvrda` skickar `email, salon, service, date, time, durationMinutes, bookingId, cancelToken`
till `app/api/send-email/route.ts`. Mejlet bygger länken `/cancel?id=...&token=...`.
`/cancel` läser exakt `id` och `token`.
**Risk:** ändras ett namn på ett ställe slutar avbokningen fungera.
Kunder utan e-post får ingen avbokningslänk.

### Tråd 7 – Notiserna i admin
Skapas av `/potvrda` (ny bokning) och `/cancel` (avbokning) i tabellen `admin_notifications`.
Adminpanelen läser dem bara.

### Tråd 8 – Gemensamma filer påverkar ALLA sidor
`app/globals.css`, `app/layout.tsx`, `lib/supabase.ts`.
`globals.css` har ett "mörkt läge" som byter färger när kundens telefon har mörkt läge.
Byt inte det globala typsnittet.

### Tråd 10 – Saker i bokningsflödet som lätt går sönder vid design
- `/times`: rutan "Nema slobodnih termina ove sedmice" räknar hur många knappar
  som finns inne i kalendern (`calendarRef`). Lägg inga andra knappar där.
- `/times`: varje tidsknapp har `data-slot="datum tid"`. En förvald tid (från
  adressen) tas bort om knappen inte finns. Ändra inte attributet.
- `/potvrda`: `formattedDate` används i notisen till admin. Ändra den inte;
  visningen på sidan använder `displayDate` / `displayTime`.
- `/times`, `/podaci`, `/potvrda` har en fast list längst ner (Nastavi /
  Završi rezervaciju) och `paddingBottom: 110px` så att inget döljs.

### Tråd 11 – Admin-kalendern och personal
- Kalenderns rader börjar på hel timme och räcker till veckans lediga tider OCH
  bokningar; bokningar placeras på exakt höjd (`bookingOffsetTop`).
- Tar man bort en person raderar databasen personens lediga tider, stängda dagar
  och tjänstekopplingar (CASCADE). Bokningarna ligger kvar – admin varnar.
- Stängda veckodagar (`closed_weekdays`) får inga lediga tider i "Raspored po sedmici".

### Tråd 9 – Mobil och desktop
Varje sida har sin egen gräns: startsidan 600/1024 px (`isTablet`/`isDesktop`),
övriga sidor 768 px (`isMobile`). En mobiländring får inte påverka desktop och tvärtom.

---

## Hur farlig är en ändring?

- 🟢 **Säker:** bara text eller färg på en sida, ingen logik.
- 🟡 **Medel:** länkar/knappar på en sida, eller en gemensam fil (`globals.css`). Testa noga.
- 🔴 **Stor försiktighet:** tidsregler (tråd 3), avbokning, kopplingen bokning–salong (tråd 2),
  säkerhet. Görs inte i punkt 8.

---

## Arbetssätt vid varje ändring

1. **Visa buggen** – skärmbild på mobil OCH desktop, före ändringen.
2. **Visa planen** – exakt vilken fil och vilka rader, och vilka trådar som berörs.
3. Ägaren säger ja.
4. **Ändra** – en sak i taget.
5. **Visa resultatet** – skärmbild på mobil OCH desktop, efter ändringen.
6. **Testlistan** nedan.
7. **Spara i Git** (ett kopierbart block).

---

## Testlista efter varje ändring (ca 3 minuter)

Gör på **mobil** och **desktop**. Använd en testsalong eller `/salon-x`.

1. Startsidan laddar, kategorier och salonger syns.
2. Öppna en salong – information, galleri och tjänster syns.
3. Tryck "Rezerviši" – tidssidan visar lediga tider.
4. Välj en person (om möjligt) och en tid → "Nastavi".
5. Fyll i uppgifter (med e-post) → "Nastavi".
6. Kontrollera att allt stämmer på bekräftelsesidan → "Završi rezervaciju".
7. "Rezervacija potvrđena" visas med rätt uppgifter.
8. Admin: bokningen syns i kalendern och som notis.
9. Mejlet har kommit – tryck "Otkaži rezervaciju" och avboka.
10. Admin: bokningen är borta och en avbokningsnotis syns.
11. Testa en "← Nazad" på vägen – inget val ska försvinna.
