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
SUMMARY:${serviceName} hos ${salonName}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
LOCATION:${salonName}
DESCRIPTION:Bokning för ${customerName}. Avboka här: ${cancelUrl}
END:VEVENT
END:VCALENDAR
`.trim();
}

const resend = new Resend(process.env.RESEND_API_KEY);

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
} = await req.json();
if (!email || !email.trim()) {
  return NextResponse.json({
    skipped: true,
    message: "Email nije unesen, potvrda nije poslana.",
  });
}

    const cancelUrl = `http://localhost:3000/cancel?id=${bookingId}&token=${cancelToken}`;

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

    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Potvrda rezervacije",
      html: `
        <h2>Rezervacija uspješna</h2>
        <p><strong>Salon:</strong> ${salon}</p>
        <p><strong>Usluga:</strong> ${service}</p>
        <p><strong>Datum:</strong> ${date}</p>
        <p><strong>Vrijeme:</strong> ${time}</p>

        <p>Otvorite priloženu kalendarsku datoteku kako biste dodali rezervaciju u svoj kalendar.</p>

        <p>
          <a href="${cancelUrl}"
             style="display:inline-block;background:#611a1a;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;">
            Otkaži rezervaciju
          </a>
        </p>
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