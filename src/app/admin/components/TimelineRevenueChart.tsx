"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { Calendar, DollarSign, ArrowUpRight } from "lucide-react";

interface TimelinePoint {
  label: string;
  revenue: number;
  bookingsCount: number;
}

interface TimelineRevenueChartProps {
  dailyData: TimelinePoint[];
  monthlyData: TimelinePoint[];
}

export default function TimelineRevenueChart({
  dailyData,
  monthlyData,
}: TimelineRevenueChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<"daily" | "monthly">("daily");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-[400px] animate-pulse bg-foreground/5 rounded-2xl" />;
  }

  const activeData = timeframe === "daily" ? dailyData : monthlyData;
  const totalPeriodRevenue = activeData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalPeriodBookings = activeData.reduce((acc, curr) => acc + curr.bookingsCount, 0);
  const textColor = resolvedTheme === "dark" ? "#888888" : "#666666";

  return (
    <div className="bg-card-bg/60 border border-card-border rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-anton text-2xl uppercase tracking-wider text-foreground">
              Revenue Over Time
            </h3>
          </div>
          <p className="text-xs text-foreground/60 mt-0.5">
            Monitor cashflow velocity and ticket conversion rates across custom intervals.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-background/80 border border-card-border p-1 rounded-xl">
          <button
            onClick={() => setTimeframe("daily")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              timeframe === "daily"
                ? "bg-primary text-black shadow-sm"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            Daily (30 Days)
          </button>
          <button
            onClick={() => setTimeframe("monthly")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              timeframe === "monthly"
                ? "bg-primary text-black shadow-sm"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            Monthly (12 Months)
          </button>
        </div>
      </div>

      {/* Snapshot Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1 border-t border-card-border/40">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase text-foreground/60 tracking-wider">
            Period Revenue
          </span>
          <p className="font-anton text-2xl text-primary font-mono">
            ₹{totalPeriodRevenue.toFixed(2)}
          </p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase text-foreground/60 tracking-wider">
            Tickets Issued
          </span>
          <p className="font-anton text-2xl text-foreground font-mono">
            {totalPeriodBookings} Passes
          </p>
        </div>
        <div className="space-y-0.5 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase text-foreground/60 tracking-wider">
            Active Granularity
          </span>
          <p className="text-sm font-bold text-foreground capitalize mt-1">
            {timeframe === "daily" ? "Daily Intervals" : "Monthly Consolidated"}
          </p>
        </div>
      </div>

      {/* Area Chart with Gradient */}
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueTimelineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              dy={10}
              minTickGap={25}
            />
            <YAxis
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${val}`}
              dx={-5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card-bg)",
                borderColor: "var(--color-card-border)",
                borderRadius: "12px",
                color: "var(--color-foreground)",
                fontSize: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
              }}
              formatter={(value: any, name: any) => [
                name === "revenue" ? `₹${Number(value).toFixed(2)}` : value,
                name === "revenue" ? "Revenue" : "Tickets",
              ]}
              labelFormatter={(label) => `Interval: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#revenueTimelineGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
