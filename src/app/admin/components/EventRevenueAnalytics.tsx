"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTheme } from "next-themes";
import { ArrowUpDown, Flame, TrendingUp, DollarSign, Award, Ticket } from "lucide-react";

export interface EventPerformanceItem {
  id: string;
  title: string;
  category: string;
  revenue: number;
  seatsBooked: number;
  capacity: number;
  occupancyPercent: number;
  price: number;
}

export default function EventRevenueAnalytics({
  events,
}: {
  events: EventPerformanceItem[];
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sortKey, setSortKey] = useState<"revenue" | "seatsBooked" | "occupancyPercent" | "price">("revenue");

  useEffect(() => {
    setMounted(true);
  }, []);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b[sortKey] - a[sortKey]);
  }, [events, sortKey]);

  if (!mounted) {
    return <div className="w-full h-80 animate-pulse bg-foreground/5 rounded-2xl" />;
  }

  const textColor = resolvedTheme === "dark" ? "#888888" : "#666666";

  // Chart data: Top 7 for visual clarity
  const chartData = sortedEvents.slice(0, 7).map((e) => ({
    name: e.title.length > 18 ? e.title.substring(0, 16) + "..." : e.title,
    fullTitle: e.title,
    revenue: e.revenue,
    seatsBooked: e.seatsBooked,
    occupancy: e.occupancyPercent,
  }));

  return (
    <div className="bg-card-bg/60 border border-card-border p-6 rounded-2xl backdrop-blur-sm space-y-6">
      {/* Header with Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-anton text-2xl uppercase tracking-wider text-foreground">
              Event-Wise Revenue &amp; Performance
            </h3>
          </div>
          <p className="text-xs text-foreground/60 mt-0.5">
            Compare gross revenue generation, attendance capacity, and live ticket velocity.
          </p>
        </div>

        {/* Graph Sorting Selector */}
        <div className="flex items-center gap-2 bg-background/80 border border-card-border px-3 py-1.5 rounded-xl shadow-sm">
          <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
            Sort Graph:
          </span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="revenue" className="bg-card-bg">Top Gross Revenue (₹)</option>
            <option value="seatsBooked" className="bg-card-bg">Most Tickets Sold</option>
            <option value="occupancyPercent" className="bg-card-bg">Highest Occupancy %</option>
            <option value="price" className="bg-card-bg">Highest Ticket Price</option>
          </select>
        </div>
      </div>

      {/* Bar Chart Representation */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 10, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (sortKey === "revenue" ? `₹${v}` : sortKey === "occupancyPercent" ? `${v}%` : v)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card-bg)",
                borderColor: "var(--color-card-border)",
                borderRadius: "12px",
                color: "var(--color-foreground)",
                fontSize: "12px",
              }}
              formatter={(value: any) => [
                sortKey === "revenue" ? `₹${Number(value).toFixed(2)}` : sortKey === "occupancyPercent" ? `${value}%` : `${value} Passes`,
                sortKey === "revenue" ? "Revenue" : sortKey === "occupancyPercent" ? "Occupancy" : "Tickets Sold",
              ]}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullTitle || label}
            />
            <Bar
              dataKey={sortKey === "occupancyPercent" ? "occupancy" : sortKey}
              radius={[6, 6, 0, 0]}
              fill="var(--color-primary)"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`bar-cell-${index}`}
                  fill={index === 0 ? "var(--color-primary)" : "rgba(255, 225, 124, 0.65)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ranked Performance Table */}
      <div className="border border-card-border/60 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-card-bg/80 border-b border-card-border/60 text-foreground/60 uppercase font-mono tracking-wider">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Event Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Ticket Price</th>
              <th className="py-3 px-4">Tickets Booked</th>
              <th className="py-3 px-4">Occupancy</th>
              <th className="py-3 px-4 text-right">Gross Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border/40 font-medium text-foreground/80">
            {sortedEvents.map((evt, idx) => (
              <tr key={evt.id} className="hover:bg-foreground/5 transition-colors">
                <td className="py-3 px-4 font-mono font-bold">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                </td>
                <td className="py-3 px-4 font-bold text-foreground">
                  <span className="line-clamp-1">{evt.title}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-foreground/10 text-[10px] font-mono font-bold uppercase">
                    {evt.category}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono">
                  {evt.price === 0 ? "FREE" : `₹${evt.price.toFixed(2)}`}
                </td>
                <td className="py-3 px-4 font-mono">
                  {evt.seatsBooked} / {evt.capacity}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-foreground/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${Math.min(100, evt.occupancyPercent)}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px]">{evt.occupancyPercent}%</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-primary text-sm">
                  ₹{evt.revenue.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
