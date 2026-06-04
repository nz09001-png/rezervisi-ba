import { supabase } from "@/lib/supabase";

export default async function AdminPage() {
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="mt-4 text-red-600">Kunde inte hämta bokningar.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold">Bokningar</h1>

        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <table className="w-full text-left">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-4">Namn</th>
                <th className="p-4">Telefon</th>
                <th className="p-4">Salong</th>
                <th className="p-4">Tid</th>
                <th className="p-4">Datum</th>
                <th className="p-4">Skapad</th>
              </tr>
            </thead>

            <tbody>
              {bookings?.map((booking) => (
                <tr key={booking.id} className="border-b">
                  <td className="p-4">{booking.customer_name}</td>
                  <td className="p-4">{booking.phone}</td>
                  <td className="p-4">{booking.salon}</td>
                  <td className="p-4">{booking.booking_time}</td>
                  <td className="p-4">{booking.booking_date}</td>
                  <td className="p-4">
                    {new Date(booking.created_at).toLocaleString("sv-SE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}