import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f3ee]">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="text-2xl font-bold">Rezervisi.ba</div>

        <nav className="hidden md:flex gap-6 text-gray-700">
          <a href="#saloni">Saloni</a>
          <a href="#kako-radi">Kako radi</a>
          <a href="#za-salone">Za salone</a>
        </nav>
      </header>

      <section className="px-8 py-20 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">
          Online rezervacije za frizerske salone
        </p>

        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          Pronađi frizera i rezerviši termin za manje od minute
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
          Rezervisi.ba pomaže ljudima da pronađu slobodne termine kod frizera u Bosni i Hercegovini.
        </p>

        <div className="mx-auto mt-10 flex max-w-xl flex-col gap-3 rounded-2xl bg-white p-3 shadow md:flex-row">
          <input
            className="flex-1 rounded-xl border px-4 py-3"
            placeholder="Pretraži grad, npr. Sarajevo"
          />

          <button className="rounded-xl bg-black px-6 py-3 font-semibold text-white">
            Pretraži
          </button>
        </div>
      </section>

      <section id="saloni" className="mx-auto max-w-6xl px-8 pb-20">
        <h2 className="mb-8 text-3xl font-bold">Popularni saloni</h2>

        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/salon-x" className="overflow-hidden rounded-3xl bg-white shadow hover:shadow-lg">
<div
  className="h-48 bg-cover bg-center"
  style={{
    backgroundImage:
      "url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80')",
  }}
></div>          <div className="p-6">
              <h3 className="text-xl font-bold">Barber House Sarajevo</h3>
              <p className="text-gray-500">Sarajevo</p>
              <p className="mt-4 font-semibold">Od 20 KM</p>
            </div>
          </Link>

          <Link href="/salon-y" className="overflow-hidden rounded-3xl bg-white shadow hover:shadow-lg">
<div
  className="h-48 bg-cover bg-center"
  style={{
    backgroundImage:
      "url('https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=800&q=80')",
  }}
></div>            <div className="p-6">
              <h3 className="text-xl font-bold">Gentlemen Tuzla</h3>
              <p className="text-gray-500">Tuzla</p>
              <p className="mt-4 font-semibold">Od 25 KM</p>
            </div>
          </Link>

          <Link href="/salon-z" className="overflow-hidden rounded-3xl bg-white shadow hover:shadow-lg">
<div
  className="h-48 bg-cover bg-center"
  style={{
    backgroundImage:
      "url('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80')",
  }}
></div>            <div className="p-6">
              <h3 className="text-xl font-bold">Mostar Fade Studio</h3>
              <p className="text-gray-500">Mostar</p>
              <p className="mt-4 font-semibold">Od 30 KM</p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}