import { Resend } from "resend";
import { NextResponse } from "next/server";

function createICS({
  serviceName,
  salonName,
  customerName,
  startDate,
  endDate,
  cancelUrl,
}: {
  serviceName: string;
  salonName: string;
  customerName: string;
  startDate: Date;
  endDate: Date;
  cancelUrl: string;
}) {
  const formatDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return `
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${crypto.randomUUID()}
SUMMARY:${serviceName} – ${salonName}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
LOCATION:${salonName}
DESCRIPTION:Rezervacija za ${customerName}. Otkažite rezervaciju ovdje: ${cancelUrl}
END:VEVENT
END:VCALENDAR
`.trim();
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Gör text från kunden säker att visa i mejlet (ingen egen kod kan smygas in).
function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// En rad i uppgiftstabellen i mejlet.
function detailRow(label: string, value: string, isFirst = false, isLast = false) {
  const top = isFirst ? "10px" : "4px";
  const bottom = isLast ? "10px" : "4px";
  return `<tr><td style="padding:${top} 0 ${bottom};color:#611a1a;font-weight:700;width:90px;vertical-align:top;">${label}</td><td style="padding:${top} 0 ${bottom};">${escapeHtml(value)}</td></tr>`;
}

export async function POST(req: Request) {
  try {
    const {
  email,
  salon,
  service,
  date,
  time,
  durationMinutes,
  bookingId,
  cancelToken,
  customerFirstName,
  staff,
  price,
  showDuration,
} = await req.json();
if (!email || !email.trim()) {
  return NextResponse.json({
    skipped: true,
    message: "Email nije unesen, potvrda nije poslana.",
  });
}

    const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const cancelUrl = `${baseUrl}/cancel?id=${bookingId}&token=${cancelToken}`;

    const startDate = new Date(`${date}T${time}:00`);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + (durationMinutes || 60));

    const icsContent = createICS({
      serviceName: service,
      salonName: salon,
      customerName: email,
      startDate,
      endDate,
      cancelUrl,
    });

    const formattedDate = date.split("-").reverse().join(".");

    // Uppgifterna i mejlet. Pris och tidslängd bara om salongen visar dem.
    const rows: [string, string][] = [
      ["Salon", salon],
      ["Usluga", service],
    ];
    if (staff) rows.push(["Osoblje", staff]);
    rows.push(["Datum", formattedDate], ["Vrijeme", time]);
    if (showDuration && durationMinutes) {
      rows.push(["Trajanje", `${durationMinutes} min`]);
    }
    if (price) rows.push(["Cijena", `${price} KM`]);

    const detailRows = rows
      .map(([label, value], index) =>
        detailRow(label, value, index === 0, index === rows.length - 1)
      )
      .join("");

    const greeting = customerFirstName
      ? `Poštovani/a ${escapeHtml(customerFirstName)}, vaš termin je uspješno rezervisan.`
      : "Vaš termin je uspješno rezervisan.";

    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `Rezervacija potvrđena – ${salon}, ${formattedDate} u ${time}`,
      // "light only": säger åt mejlappar (t.ex. iPhones Mail) att inte göra om
      // mejlet till mörka färger när telefonen har mörkt läge.
      html: `
<!doctype html>
<html lang="bs" style="color-scheme:light only;">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<style>
  :root { color-scheme: light only; supported-color-schemes: light only; }
</style>
</head>
<body style="margin:0;padding:0;background:#f7f3ee;">
<div style="margin:0;padding:24px 12px;background:#f7f3ee;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;">
    <tr><td align="center" style="padding:0 0 18px;">
      <span style="font-size:22px;letter-spacing:6px;color:#611a1a;font-weight:600;">SALONIX</span>
    </td></tr>
    <tr><td style="background:#ffffff;border-radius:20px;padding:28px 24px;border:1px solid #eadede;">
      <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#611a1a;">Rezervacija potvrđena</p>
      <p style="margin:0 0 20px;font-size:15px;color:#6b7280;">${greeting}</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0e6e6;border-bottom:1px solid #f0e6e6;font-size:15px;color:#111827;">
        ${detailRows}
      </table>

      <p style="margin:18px 0 20px;font-size:14px;color:#6b7280;">U prilogu je kalendarska datoteka – otvorite je da dodate termin u svoj kalendar.</p>

      <p style="margin:0 0 8px;font-size:14px;color:#111827;">Ne možete doći? Otkažite termin na vrijeme:</p>
      <a href="${cancelUrl}" style="display:inline-block;background:#611a1a;color:#ffffff;padding:12px 22px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">Otkaži rezervaciju</a>
    </td></tr>
    <tr><td align="center" style="padding:18px 8px 0;font-size:12px;color:#9ca3af;">
      Ovo je automatska poruka – molimo ne odgovarajte na nju.<br>© ${new Date().getFullYear()} Salonix · salonix.ba
    </td></tr>
  </table>
</div>
</body>
</html>
      `,
      attachments: [
        {
          filename: "rezervacija.ics",
          content: Buffer.from(icsContent).toString("base64"),
        },
      ],
    });

    return NextResponse.json(data);
  } catch (error) {
  console.error("SEND EMAIL ERROR:", error);

  return NextResponse.json(
    {
      error: "Greška pri slanju emaila",
      details: String(error),
    },
    { status: 500 }
  );
}
}