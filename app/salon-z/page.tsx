import Link from "next/link";

export default function SalonZ() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">
          Salon Z
        </h1>

        <p className="text-gray-600 mb-8">
          Mostar
        </p>

        <h2 className="text-2xl font-bold mb-4">
          Usluge
        </h2>

        <ul className="mb-8">
          <li>✂️ Muško šišanje - 30 KM</li>
          <li>🧔 Trimovanje brade - 15 KM</li>
          <li>👦 Dječije šišanje - 20 KM</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4">
          Slobodni termini
        </h2>

        <div className="flex gap-4 flex-wrap">
          <Link href="/booking?salon=Salon%20Z&time=09:00" className="bg-white p-4 rounded-lg shadow">
            09:00
          </Link>

          <Link href="/booking?salon=Salon%20Z&time=10:00" className="bg-white p-4 rounded-lg shadow">
            10:00
          </Link>

          <Link href="/booking?salon=Salon%20Z&time=11:00" className="bg-white p-4 rounded-lg shadow">
            11:00
          </Link>
        </div>
      </div>
    </main>
  );
}