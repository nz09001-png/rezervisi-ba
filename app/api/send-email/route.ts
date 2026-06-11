import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, salon, service, date, time, bookingId } = await req.json();

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

  <p>
    <a href="http://localhost:3000/cancel?id=${bookingId}"
       style="display:inline-block;background:#000;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;">
      Otkaži rezervaciju
    </a>
  </p>
`,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Greška pri slanju emaila" },
      { status: 500 }
    );
  }
}