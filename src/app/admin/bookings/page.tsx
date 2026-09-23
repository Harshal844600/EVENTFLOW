import { prisma } from "@/lib/prisma";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      event: true,
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="font-anton text-4xl uppercase">All Bookings</h2>

      <div className="bg-card-bg border border-card-border rounded overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-foreground/5 border-b border-card-border text-secondary text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Booking ID</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Event</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-secondary">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-foreground/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">
                    {booking.id.split('-')[0]}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground">{booking.user.name}</p>
                    <p className="text-secondary text-xs">{booking.user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground line-clamp-1">{booking.event.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      booking.status === 'CONFIRMED' ? 'bg-secondary/20 text-secondary' :
                      booking.status === 'PENDING' ? 'bg-primary/20 text-primary' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">₹{Number(booking.totalAmount).toFixed(2)}</p>
                    <p className="text-xs text-secondary">{booking.quantity} ticket(s)</p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
