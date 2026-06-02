import Link from "next/link";

export default function SalonY() {
  return (
    <main className="min-h-screen bg-[#f7f3ee]">
      <section
        className="h-72 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1200&q=80')",
        }}
      ></section>

      <section className="mx-auto max-w-4xl px-8 py-10">
        <div className="rounded-3xl bg-white p-8 shadow">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Tuzla
          </p>

          <h1 className="text-5xl font-bold mb-4">
            Gentlemen Tuzla
          </h1>

          <p className="mb-6 text-gray-600">
            Klasično i moderno šišanje za muškarce, bradu i stilizovanje.
          </p>

          <div className="mb-8 flex flex-wrap gap-4 text-sm text-gray-700">
            <div className="mb-8 grid gap-4 md:grid-cols-3">
  <div className="rounded-xl bg-gray-50 p-4">
    <p className="text-sm text-gray-500">Adresa</p>
    <p className="font-semibold">Korzo 8, Tuzla</p>
  </div>

  <div className="rounded-xl bg-gray-50 p-4">
    <p className="text-sm text-gray-500">Telefon</p>
    <p className="font-semibold">+387 62 222 333</p>
  </div>

  <div className="rounded-xl bg-gray-50 p-4">
    <p className="text-sm text-gray-500">Radno vrijeme</p>
    <p className="font-semibold">10:00 - 19:00</p>
  </div>
</div>
            <span>⭐ 4.8 (98 recenzije)</span>
            <span>📍 Tuzla</span>
            <span>🕒 Otvoreno danas</span>
          </div>

          <h2 className="text-2xl font-bold mb-4">Usluge</h2>

          <div className="mb-8 space-y-3">
            <div className="flex justify-between rounded-xl bg-gray-50 p-4">
              <span>✂️ Muško šišanje</span>
              <strong>25 KM</strong>
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
            <Link href="/booking?salon=Gentlemen%20Tuzla&time=09:00" className="rounded-xl bg-black p-4 text-center font-semibold text-white">
              09:00
            </Link>

            <Link href="/booking?salon=Gentlemen%20Tuzla&time=10:00" className="rounded-xl bg-black p-4 text-center font-semibold text-white">
              10:00
            </Link>

            <Link href="/booking?salon=Gentlemen%20Tuzla&time=11:00" className="rounded-xl bg-black p-4 text-center font-semibold text-white">
              11:00
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}