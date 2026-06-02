import Link from "next/link";

export default function SalonZ() {
  return (
    <main className="min-h-screen bg-[#f7f3ee]">
      <section
        className="h-72 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80')",
        }}
      ></section>

      <section className="mx-auto max-w-4xl px-8 py-10">
        <div className="rounded-3xl bg-white p-8 shadow">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Mostar
          </p>

          <h1 className="text-5xl font-bold mb-4">
            Mostar Fade Studio
          </h1>

          <p className="mb-6 text-gray-600">
            Premium fade šišanje, uređivanje brade i moderan barber stil.
          </p>

          <div className="mb-8 flex flex-wrap gap-4 text-sm text-gray-700">
            <div className="mb-8 grid gap-4 md:grid-cols-3">
  <div className="rounded-xl bg-gray-50 p-4">
    <p className="text-sm text-gray-500">Adresa</p>
    <p className="font-semibold">Braće Fejića 21, Mostar</p>
  </div>

  <div className="rounded-xl bg-gray-50 p-4">
    <p className="text-sm text-gray-500">Telefon</p>
    <p className="font-semibold">+387 63 444 555</p>
  </div>

  <div className="rounded-xl bg-gray-50 p-4">
    <p className="text-sm text-gray-500">Radno vrijeme</p>
    <p className="font-semibold">09:00 - 20:00</p>
  </div>
</div>
            <span>⭐ 4.9 (137 recenzije)</span>
            <span>📍 Mostar</span>
            <span>🕒 Otvoreno danas</span>
          </div>

          <h2 className="text-2xl font-bold mb-4">Usluge</h2>

          <div className="mb-8 space-y-3">
            <div className="flex justify-between rounded-xl bg-gray-50 p-4">
              <span>✂️ Muško šišanje</span>
              <strong>30 KM</strong>
            </div>

            <div className="flex justify-between rounded-xl bg-gray-50 p-4">
              <span>🧔 Trimovanje brade</span>
              <strong>15 KM</strong>
            </div>

            <div className="flex justify-between rounded-xl bg-gray-50 p-4">
              <span>👦 Dječije šišanje</span>
              <strong>20 KM</strong>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Slobodni termini</h2>

          <div className="grid grid-cols-3 gap-4">
            <Link href="/booking?salon=Mostar%20Fade%20Studio&time=09:00" className="rounded-xl bg-black p-4 text-center font-semibold text-white">
              09:00
            </Link>

            <Link href="/booking?salon=Mostar%20Fade%20Studio&time=10:00" className="rounded-xl bg-black p-4 text-center font-semibold text-white">
              10:00
            </Link>

            <Link href="/booking?salon=Mostar%20Fade%20Studio&time=11:00" className="rounded-xl bg-black p-4 text-center font-semibold text-white">
              11:00
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}