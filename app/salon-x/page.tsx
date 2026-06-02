import Link from "next/link";

export default function SalonX() {
  return (
    <main className="min-h-screen bg-[#f7f3ee]">
      <section
        className="h-72 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80')",
        }}
      ></section>

      <section className="mx-auto max-w-4xl px-8 py-10">
        <div className="rounded-3xl bg-white p-8 shadow">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Sarajevo
          </p>

          <h1 className="text-5xl font-bold mb-4">
            Barber House Sarajevo
          </h1>

          <p className="mb-6 text-gray-600">
            Moderan frizerski salon za muško šišanje, bradu i dječije šišanje.
          </p>

          <div className="mb-8 flex flex-wrap gap-4 text-sm text-gray-700">
            <span>⭐ 4.9 (124 recenzije)</span>
            <span>📍 Sarajevo</span>
            <span>🕒 Otvoreno danas</span>
          </div>
<div className="mb-8 grid gap-4 md:grid-cols-3">
  <div className="rounded-xl bg-gray-50 p-4">
    <p className="text-sm text-gray-500">Adresa</p>
    <p className="font-semibold">Ferhadija 12, Sarajevo</p>
  </div>

  <div className="rounded-xl bg-gray-50 p-4">
    <p className="text-sm text-gray-500">Telefon</p>
    <p className="font-semibold">+387 61 123 456</p>
  </div>

  <div className="rounded-xl bg-gray-50 p-4">
    <p className="text-sm text-gray-500">Radno vrijeme</p>
    <p className="font-semibold">09:00 - 18:00</p>
  </div>
</div>

          <h2 className="text-2xl font-bold mb-4">Usluge</h2>

          <div className="mb-8 space-y-3">
            <div className="flex justify-between rounded-xl bg-gray-50 p-4">
              <span>✂️ Muško šišanje</span>
              <strong>20 KM</strong>
            </div>

            <div className="flex justify-between rounded-xl bg-gray-50 p-4">
              <span>🧔 Trimovanje brade</span>
              <strong>10 KM</strong>
            </div>

            <div className="flex justify-between rounded-xl bg-gray-50 p-4">
              <span>👦 Dječije šišanje</span>
              <strong>15 KM</strong>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Slobodni termini</h2>

          <div className="grid grid-cols-3 gap-4">
            <Link href="/booking?salon=Barber%20House%20Sarajevo&time=09:00" className="rounded-xl bg-black p-4 text-center font-semibold text-white">
              09:00
            </Link>

            <Link href="/booking?salon=Barber%20House%20Sarajevo&time=10:00" className="rounded-xl bg-black p-4 text-center font-semibold text-white">
              10:00
            </Link>

            <Link href="/booking?salon=Barber%20House%20Sarajevo&time=11:00" className="rounded-xl bg-black p-4 text-center font-semibold text-white">
              11:00
            </Link>
          </div>
        </div><h2 className="mt-10 mb-4 text-2xl font-bold">
  Recenzije
</h2>

<div className="space-y-4">
  <div className="rounded-xl bg-gray-50 p-4">
    <p className="font-semibold">Amar ⭐⭐⭐⭐⭐</p>
    <p className="text-gray-600">
      Odlična usluga i vrlo ljubazno osoblje.
    </p>
  </div>

  <div className="rounded-xl bg-gray-50 p-4">
    <p className="font-semibold">Jasmin ⭐⭐⭐⭐⭐</p>
    <p className="text-gray-600">
      Najbolji fade u Sarajevu. Preporučujem.
    </p>
  </div>

  <div className="rounded-xl bg-gray-50 p-4">
    <p className="font-semibold">Haris ⭐⭐⭐⭐</p>
    <p className="text-gray-600">
      Brza rezervacija i kvalitetno šišanje.
    </p>
  </div>
</div>
      </section>
    </main>
  );
}