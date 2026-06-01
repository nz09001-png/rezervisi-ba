import Link from "next/link";

export default function SalonX() {

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">
          Salon X
        </h1>

        <p className="text-gray-600 mb-8">
          Sarajevo
        </p>

        <h2 className="text-2xl font-bold mb-4">
          Usluge
        </h2>

        <ul className="mb-8">
          <li>✂️ Muško šišanje - 20 KM</li>
          <li>🧔 Trimovanje brade - 10 KM</li>
          <li>👦 Dječije šišanje - 15 KM</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4">
          Slobodni termini
        </h2>

        <div className="flex gap-4 flex-wrap">
  <Link href="/booking?salon=Salon%20X&time=09:00" className="bg-white p-4 rounded-lg shadow">
  09:00
</Link>

<Link href="/booking?salon=Salon%20X&time=10:00" className="bg-white p-4 rounded-lg shadow">
  10:00
</Link>

<Link href="/booking?salon=Salon%20X&time=11:00" className="bg-white p-4 rounded-lg shadow">
  11:00
</Link>
        </div>
      </div>
    </main>
  );
}