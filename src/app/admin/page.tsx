import { prisma } from "@/lib/prisma";
import AnimatedCounter from "./components/AnimatedCounter";
import TimelineRevenueChart from "./components/TimelineRevenueChart";
import EventRevenueAnalytics, { EventPerformanceItem } from "./components/EventRevenueAnalytics";
import DemographicsChart from "./components/DemographicsChart";
import { subDays, subMonths, format, startOfMonth, endOfMonth } from "date-fns";
import { Ticket, Users, DollarSign, Hourglass, ShieldAlert, Sparkles } from "lucide-react";

export default async function AdminDashboardPage() {
  // 1. Aggregate High-Level Metrics
  const [
    totalUsers,
    totalEvents,
    confirmedBookingsCount,
    cancelledBookingsCount,
    totalWaitlistsCount,
    revenueData,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
    prisma.waitlist.count({ where: { status: "WAITING" } }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { totalAmount: true },
    }),
  ]);

  const totalRevenue = revenueData._sum.totalAmount ? Number(revenueData._sum.totalAmount) : 0;

  // 2. Timeline Revenue: Daily Data (Last 30 Days)
  const thirtyDaysAgo = subDays(new Date(), 30);
  const dailyBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      createdAt: { gte: thirtyDaysAgo },
    },
    select: {
      totalAmount: true,
      createdAt: true,
    },
  });

  const dailyData = Array.from({ length: 30 }).map((_, i) => {
    const date = subDays(new Date(), 29 - i);
    const label = format(date, "MMM dd");
    const matchingBookings = dailyBookings.filter(
      (b) => format(new Date(b.createdAt), "MMM dd") === label
    );
    const revenue = matchingBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    return {
      label,
      revenue,
      bookingsCount: matchingBookings.length,
    };
  });

  // 3. Timeline Revenue: Monthly Data (Last 12 Months)
  const twelveMonthsAgo = subMonths(new Date(), 12);
  const monthlyBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      createdAt: { gte: twelveMonthsAgo },
    },
    select: {
      totalAmount: true,
      createdAt: true,
    },
  });

  const monthlyData = Array.from({ length: 12 }).map((_, i) => {
    const monthDate = subMonths(new Date(), 11 - i);
    const label = format(monthDate, "MMM yyyy");
    const monthKey = format(monthDate, "yyyy-MM");
    const matchingBookings = monthlyBookings.filter(
      (b) => format(new Date(b.createdAt), "yyyy-MM") === monthKey
    );
    const revenue = matchingBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    return {
      label,
      revenue,
      bookingsCount: matchingBookings.length,
    };
  });

  // 4. Event-Wise Revenue & Performance Breakdown
  const eventsWithBookings = await prisma.event.findMany({
    include: {
      bookings: {
        where: { status: "CONFIRMED" },
        select: { totalAmount: true, quantity: true },
      },
    },
  });

  const eventPerformanceList: EventPerformanceItem[] = eventsWithBookings.map((evt) => {
    const revenue = evt.bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const occupancyPercent = evt.capacity > 0 ? Math.round((evt.seatsBooked / evt.capacity) * 100) : 0;
    return {
      id: evt.id,
      title: evt.title,
      category: evt.category,
      revenue,
      seatsBooked: evt.seatsBooked,
      capacity: evt.capacity,
      occupancyPercent,
      price: Number(evt.price),
    };
  });

  // 5. Demographics Analysis: Gender & Real Age Distribution
  const users = await prisma.user.findMany({
    select: { gender: true, age: true },
  });

  const genderCounts: Record<string, number> = {
    Male: 0,
    Female: 0,
    "Non-Binary": 0,
    Other: 0,
  };

  const ageBrackets: Record<string, number> = {
    "Under 18": 0,
    "18-24": 0,
    "25-34": 0,
    "35-44": 0,
    "45-54": 0,
    "55+": 0,
  };

  const usersWithAge = users.filter((u) => u.age !== null && u.age !== undefined && u.age > 0);
  const recordedAgeCount = usersWithAge.length;
  const totalUsersCount = users.length;

  users.forEach((u) => {
    // Gender
    const g = u.gender || "Other";
    if (genderCounts[g] !== undefined) {
      genderCounts[g]++;
    } else {
      genderCounts["Other"]++;
    }

    // Real Age Categorization
    if (u.age !== null && u.age !== undefined && u.age > 0) {
      if (u.age < 18) ageBrackets["Under 18"]++;
      else if (u.age <= 24) ageBrackets["18-24"]++;
      else if (u.age <= 34) ageBrackets["25-34"]++;
      else if (u.age <= 44) ageBrackets["35-44"]++;
      else if (u.age <= 54) ageBrackets["45-54"]++;
      else ageBrackets["55+"]++;
    }
  });

  const avgAge =
    recordedAgeCount > 0
      ? Math.round(usersWithAge.reduce((sum, u) => sum + (u.age || 0), 0) / recordedAgeCount)
      : null;

  const minAge = recordedAgeCount > 0 ? Math.min(...usersWithAge.map((u) => u.age!)) : null;
  const maxAge = recordedAgeCount > 0 ? Math.max(...usersWithAge.map((u) => u.age!)) : null;

  // Exact age frequencies for real age chart
  const exactAgeCounts: Record<number, number> = {};
  usersWithAge.forEach((u) => {
    const a = u.age!;
    exactAgeCounts[a] = (exactAgeCounts[a] || 0) + 1;
  });
  const exactAgeData = Object.entries(exactAgeCounts)
    .map(([age, count]) => ({ age: Number(age), count }))
    .sort((a, b) => a.age - b.age);

  const genderData = Object.entries(genderCounts).map(([name, value]) => ({ name, value }));
  const ageData = Object.entries(ageBrackets).map(([bracket, count]) => ({
    bracket,
    count,
    percentage: recordedAgeCount > 0 ? Math.round((count / recordedAgeCount) * 100) : 0,
  }));

  const ageMetrics = {
    avgAge,
    minAge,
    maxAge,
    recordedCount: recordedAgeCount,
    unspecifiedCount: totalUsersCount - recordedAgeCount,
    totalUsers: totalUsersCount,
    completionRate: totalUsersCount > 0 ? Math.round((recordedAgeCount / totalUsersCount) * 100) : 0,
  };

  // 6. Recent Activity Feeds
  const [recentBookings, recentLogs] = await Promise.all([
    prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true } },
      },
    }),
    prisma.adminLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        admin: { select: { name: true, email: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-10 pb-16">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-anton text-4xl sm:text-5xl uppercase tracking-wider text-foreground">
            Platform Analytics &amp; Control
          </h2>
          <p className="text-xs sm:text-sm text-foreground/60 mt-1">
            Real-time business intelligence, cashflow velocity, and attendee demographics.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold font-mono self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ANALYTICS ENGINE ONLINE</span>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card-bg/60 border border-card-border p-6 rounded-2xl backdrop-blur-sm card-hover shadow-lg">
          <div className="flex items-center justify-between mb-3 text-secondary text-xs font-bold uppercase tracking-wider">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <p className="font-anton text-4xl text-primary font-mono">
            <AnimatedCounter value={totalRevenue} prefix="₹" decimals={2} />
          </p>
          <span className="text-[11px] text-emerald-500 font-mono font-bold mt-2 block">
            ↑ 100% Reconciled
          </span>
        </div>

        <div className="bg-card-bg/60 border border-card-border p-6 rounded-2xl backdrop-blur-sm card-hover shadow-lg">
          <div className="flex items-center justify-between mb-3 text-secondary text-xs font-bold uppercase tracking-wider">
            <span>Active Passes</span>
            <Ticket className="w-4 h-4 text-primary" />
          </div>
          <p className="font-anton text-4xl text-foreground font-mono">
            <AnimatedCounter value={confirmedBookingsCount} />
          </p>
          <span className="text-[11px] text-foreground/60 font-mono mt-2 block">
            {cancelledBookingsCount} Cancellations Handled
          </span>
        </div>

        <div className="bg-card-bg/60 border border-card-border p-6 rounded-2xl backdrop-blur-sm card-hover shadow-lg">
          <div className="flex items-center justify-between mb-3 text-secondary text-xs font-bold uppercase tracking-wider">
            <span>Waiting In Queue</span>
            <Hourglass className="w-4 h-4 text-primary" />
          </div>
          <p className="font-anton text-4xl text-amber-500 font-mono">
            <AnimatedCounter value={totalWaitlistsCount} />
          </p>
          <span className="text-[11px] text-amber-500/80 font-mono mt-2 block">
            Pending Seat Allocation
          </span>
        </div>

        <div className="bg-card-bg/60 border border-card-border p-6 rounded-2xl backdrop-blur-sm card-hover shadow-lg">
          <div className="flex items-center justify-between mb-3 text-secondary text-xs font-bold uppercase tracking-wider">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="font-anton text-4xl text-foreground font-mono">
            <AnimatedCounter value={totalUsers} />
          </p>
          <span className="text-[11px] text-foreground/60 font-mono mt-2 block">
            Across {totalEvents} Hosted Events
          </span>
        </div>
      </div>

      {/* Date & Month-Wise Revenue Generation Chart */}
      <TimelineRevenueChart dailyData={dailyData} monthlyData={monthlyData} />

      {/* Event-Wise Revenue Generation with Graph Sorting & Performance Table */}
      <EventRevenueAnalytics events={eventPerformanceList} />

      {/* Gender & Real Age Demographic Breakdown */}
      <DemographicsChart
        genderData={genderData}
        ageData={ageData}
        exactAgeData={exactAgeData}
        ageMetrics={ageMetrics}
      />

      {/* Recent Activity and Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings Feed */}
        <div className="bg-card-bg/60 border border-card-border rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-card-border flex items-center justify-between">
            <h3 className="font-anton text-2xl uppercase tracking-wider text-foreground">
              Recent Transactions
            </h3>
            <span className="text-xs text-foreground/60 font-mono">Latest 6</span>
          </div>
          <div className="divide-y divide-card-border/40">
            {recentBookings.length === 0 ? (
              <p className="p-8 text-center text-foreground/60">No bookings recorded yet.</p>
            ) : (
              recentBookings.map((b) => (
                <div key={b.id} className="p-5 hover:bg-foreground/5 transition-colors flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-foreground text-sm">{b.user.name}</p>
                    <p className="text-xs text-foreground/60 line-clamp-1">{b.event.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        b.status === "CONFIRMED"
                          ? "bg-primary/20 text-foreground border border-primary/20"
                          : b.status === "CANCELLED"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-secondary/20 text-foreground"
                      }`}
                    >
                      {b.status}
                    </span>
                    <p className="font-mono font-bold text-xs text-primary mt-1">
                      ₹{Number(b.totalAmount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Security Logs */}
        <div className="bg-card-bg/60 border border-card-border rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-card-border flex items-center justify-between">
            <h3 className="font-anton text-2xl uppercase tracking-wider text-foreground">
              Admin &amp; Security Logs
            </h3>
            <span className="text-xs text-foreground/60 font-mono">Live Audits</span>
          </div>
          <div className="divide-y divide-card-border/40">
            {recentLogs.length === 0 ? (
              <p className="p-8 text-center text-foreground/60">No administrative logs recorded.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="p-5 hover:bg-foreground/5 transition-colors flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary text-xs">
                    🛡️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      <span className="text-primary">{log.admin.name}</span>: {log.action.replace(/_/g, " ").toLowerCase()}
                    </p>
                    <p className="text-[11px] text-foreground/60 font-mono truncate mt-0.5">
                      Target: {log.targetType} ({log.targetId.substring(0, 10)}...)
                    </p>
                  </div>
                  <span className="text-[11px] text-foreground/50 font-mono shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
