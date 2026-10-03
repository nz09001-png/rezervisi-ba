import { Resend } from "resend";
import { NextResponse } from "next/server";

// Mejl till kunden när SALONGEN avbokar en bokning i admin.
// Egen fil, så att bokningsmejlet (app/api/send-email/route.ts) inte påverkas.

const resend = new Resend(process.env.RESEND_API_KEY);

// Gör text säker att visa i mejlet (ingen egen kod kan smygas in).
function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function detailRow(label: string, value: string, isFirst = false, isLast = false) {
  const top = isFirst ? "10px" : "4px";
  const bottom = isLast ? "10px" : "4px";
  return `<tr><td style="padding:${top} 0 ${bottom};color:#611a1a;font-weight:700;width:90px;vertical-align:top;">${label}</td><td style="padding:${top} 0 ${bottom};">${escapeHtml(value)}</td></tr>`;
}

export async function POST(req: Request) {
  try {
    const { email, customerName, salon, service, date, time } = await req.json();

    if (!email || !String(email).trim()) {
      return NextResponse.json({ skipped: true });
    }

    const formattedDate = String(date || "").split("-").reverse().join(".");
    const formattedTime = String(time || "").slice(0, 5);
    const firstName = String(customerName || "").trim().split(/\s+/)[0];

    const rows: [string, string][] = [["Salon", salon]];
    if (service) rows.push(["Usluga", service]);
    rows.push(["Datum", formattedDate], ["Vrijeme", formattedTime]);

    const detailRows = rows
      .map(([label, value], index) =>
        detailRow(label, value, index === 0, index === rows.length - 1)
      )
      .join("");

    const greeting = firstName
      ? `Poštovani/a ${escapeHtml(firstName)}, salon je nažalost otkazao vaš termin.`
      : "Salon je nažalost otkazao vaš termin.";

    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `Rezervacija otkazana – ${salon}, ${formattedDate} u ${formattedTime}`,
      // "light only": mejlappar (t.ex. iPhones Mail) gör inte om färgerna i mörkt läge.
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
      <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#611a1a;">Rezervacija otkazana</p>
      <p style="margin:0 0 20px;font-size:15px;color:#6b7280;">${greeting}</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0e6e6;border-bottom:1px solid #f0e6e6;font-size:15px;color:#111827;">
        ${detailRows}
      </table>

      <p style="margin:18px 0 0;font-size:14px;color:#6b7280;">Za novi termin posjetite salonix.ba.</p>
    </td></tr>
    <tr><td align="center" style="padding:18px 8px 0;font-size:12px;color:#9ca3af;">
      Ovo je automatska poruka – molimo ne odgovarajte na nju.<br>© ${new Date().getFullYear()} Salonix · salonix.ba
    </td></tr>
  </table>
</div>
</body>
</html>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("SEND CANCEL EMAIL ERROR:", error);

    return NextResponse.json(
      { error: "Greška pri slanju emaila" },
      { status: 500 }
    );
  }
}
