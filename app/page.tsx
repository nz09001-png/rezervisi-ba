 import Link from "next/link";
 export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4">
          Rezervisi.ba
        </h1>

        <p className="text-xl text-center text-gray-600 mb-8">
          Pronađi i rezerviši termin kod svog frizera
        </p>

        <div className="flex justify-center mb-10">
          <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800">
            Pretraži salone
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-6">
          Popularni saloni
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
           <Link href="/salon-x" className="bg-white p-6 rounded-xl shadow block hover:shadow-lg">
  <h3 className="font-bold text-lg">Salon X</h3>
  <p className="text-gray-500">Sarajevo</p>
</Link>

          <Link href="/salon-y" className="bg-white p-6 rounded-xl shadow block hover:shadow-lg">
  <h3 className="font-bold text-lg">Salon Y</h3>
  <p className="text-gray-500">Tuzla</p>
</Link>

<Link href="/salon-z" className="bg-white p-6 rounded-xl shadow block hover:shadow-lg">
  <h3 className="font-bold text-lg">Salon Z</h3>
  <p className="text-gray-500">Mostar</p>
</Link>
          </div>
      </div>
    </main>
  );
}