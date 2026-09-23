import { prisma } from "@/lib/prisma";
import DashboardChart from "./components/DashboardChart";
import AnimatedCounter from "./components/AnimatedCounter";
import { subDays, format } from "date-fns";

export default async function AdminDashboardPage() {
  // Aggregate Metrics
  const [
    totalUsers,
    totalEvents,
    confirmedBookingsCount,
    revenueData
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { totalAmount: true }
    })
  ]);

  const totalRevenue = revenueData._sum.totalAmount ? Number(revenueData._sum.totalAmount) : 0;

  // Data for chart (Last 30 days)
  const thirtyDaysAgo = subDays(new Date(), 30);
  const chartBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      createdAt: { gte: thirtyDaysAgo }
    },
    select: {
      totalAmount: true,
      createdAt: true
    }
  });

  const chartData = Array.from({ length: 30 }).map((_, i) => {
    const date = subDays(new Date(), 29 - i);
    const formattedDate = format(date, "MMM dd");
    const dayBookings = chartBookings.filter(
      b => format(new Date(b.createdAt), "MMM dd") === formattedDate
    );
    const revenue = dayBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    return { date: formattedDate, revenue };
  });

  // Recent Data
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      event: { select: { title: true } }
    }
  });

  const recentLogs = await prisma.adminLog.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      admin: { select: { name: true, email: true } }
    }
  });

  return (
    <div className="space-y-8">
      <h2 className="font-anton text-4xl uppercase mb-8 animate-fade-in-up">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-xl animate-fade-in-up delay-100 card-hover">
          <p className="text-secondary text-sm font-bold uppercase tracking-wider mb-2">Total Revenue</p>
          <p className="font-anton text-4xl text-primary">
            <AnimatedCounter value={totalRevenue} prefix="₹" decimals={2} />
          </p>
        </div>
        
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-xl animate-fade-in-up delay-200 card-hover">
          <p className="text-secondary text-sm font-bold uppercase tracking-wider mb-2">Confirmed Bookings</p>
          <p className="font-anton text-4xl text-foreground">
            <AnimatedCounter value={confirmedBookingsCount} />
          </p>
        </div>

        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-xl animate-fade-in-up delay-300 card-hover">
          <p className="text-secondary text-sm font-bold uppercase tracking-wider mb-2">Total Events</p>
          <p className="font-anton text-4xl text-foreground">
            <AnimatedCounter value={totalEvents} />
          </p>
        </div>

        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-xl animate-fade-in-up delay-400 card-hover">
          <p className="text-secondary text-sm font-bold uppercase tracking-wider mb-2">Total Users</p>
          <p className="font-anton text-4xl text-foreground">
            <AnimatedCounter value={totalUsers} />
          </p>
        </div>
      </div>

      <div className="mt-12 bg-card-bg border border-card-border rounded-xl p-6 shadow-xl animate-fade-in-up delay-500">
        <h3 className="font-anton text-2xl uppercase tracking-wider text-secondary mb-6">Revenue Over Time</h3>
        <DashboardChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 animate-fade-in-up delay-500">
        <div className="bg-card-bg border border-card-border rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-card-border">
            <h3 className="font-anton text-2xl uppercase tracking-wider text-secondary">Recent Bookings</h3>
          </div>
          <div className="divide-y divide-card-border">
            {recentBookings.length === 0 ? (
              <p className="p-6 opacity-70 text-center">No bookings yet.</p>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-foreground/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-foreground">{booking.user.name}</p>
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      booking.status === 'CONFIRMED' ? 'bg-secondary/20 text-secondary' :
                      booking.status === 'PENDING' ? 'bg-primary/20 text-primary' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-secondary">{booking.event.title}</p>
                  <div className="flex justify-between mt-2 text-xs opacity-70">
                    <span>{booking.quantity} Ticket(s)</span>
                    <span>₹{Number(booking.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card-bg border border-card-border rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-card-border">
            <h3 className="font-anton text-2xl uppercase tracking-wider text-secondary">Audit Logs</h3>
          </div>
          <div className="divide-y divide-card-border">
            {recentLogs.length === 0 ? (
              <p className="p-6 opacity-70 text-center">No logs recorded.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-foreground/5 transition-colors flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 flex flex-shrink-0 items-center justify-center text-xs">
                    🛡️
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">
                      <span className="text-primary">{log.admin.name}</span> {log.action.replace(/_/g, ' ').toLowerCase()}
                    </p>
                    <p className="text-xs text-secondary mt-1">
                      {log.targetType}: {log.targetId.substring(0,8)}...
                    </p>
                  </div>
                  <div className="text-xs opacity-70 text-right">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
