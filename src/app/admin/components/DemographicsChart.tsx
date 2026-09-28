"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { Users, Sparkles, Calendar, TrendingUp, Info } from "lucide-react";

interface DemographicsProps {
  genderData: { name: string; value: number }[];
  ageData: { bracket: string; count: number; percentage?: number }[];
  exactAgeData?: { age: number; count: number }[];
  ageMetrics?: {
    avgAge: number | null;
    minAge: number | null;
    maxAge: number | null;
    recordedCount: number;
    unspecifiedCount: number;
    totalUsers: number;
    completionRate: number;
  };
}

const GENDER_COLORS = ["#ffe17c", "#60a5fa", "#f472b6", "#a78bfa", "#94a3b8"];

export default function DemographicsChart({
  genderData,
  ageData,
  exactAgeData = [],
  ageMetrics,
}: DemographicsProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"bracket" | "exact">("bracket");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-72 animate-pulse bg-foreground/5 rounded-2xl" />;
  }

  const textColor = resolvedTheme === "dark" ? "#a3a3a3" : "#525252";
  const hasRealAgeData = (ageMetrics?.recordedCount || 0) > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gender Distribution Donut */}
      <div className="bg-card-bg/60 border border-card-border p-6 rounded-2xl backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h4 className="font-anton text-xl uppercase tracking-wider text-foreground">
              Attendee Gender Ratio
            </h4>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Real-Time
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                    stroke="var(--color-card-bg)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card-bg)",
                  borderColor: "var(--color-card-border)",
                  borderRadius: "12px",
                  color: "var(--color-foreground)",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                }}
                formatter={(value: any) => [`${value} Attendees`, "Count"]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(val) => (
                  <span style={{ color: textColor, fontSize: "12px", fontWeight: "600" }}>
                    {val}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real Age Demographics Graph */}
      <div className="bg-card-bg/60 border border-card-border p-6 rounded-2xl backdrop-blur-sm space-y-4 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h4 className="font-anton text-xl uppercase tracking-wider text-foreground">
                Real Attendee Age Graph
              </h4>
            </div>

            {/* Toggle view button if exact ages exist */}
            {exactAgeData.length > 0 && (
              <div className="flex items-center bg-card-bg border border-card-border rounded-lg p-0.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode("bracket")}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    viewMode === "bracket"
                      ? "bg-primary text-charcoal font-black"
                      : "text-secondary hover:text-foreground"
                  }`}
                >
                  Age Brackets
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("exact")}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    viewMode === "exact"
                      ? "bg-primary text-charcoal font-black"
                      : "text-secondary hover:text-foreground"
                  }`}
                >
                  Exact Ages
                </button>
              </div>
            )}
          </div>

          {/* Real Metrics Pill Ribbon */}
          {ageMetrics && (
            <div className="flex items-center gap-2 flex-wrap pt-3">
              {ageMetrics.avgAge !== null ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Avg: {ageMetrics.avgAge} yrs</span>
                </div>
              ) : null}

              {ageMetrics.minAge !== null && ageMetrics.maxAge !== null && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card-bg border border-card-border text-foreground text-xs font-mono">
                  <span>Range: {ageMetrics.minAge}–{ageMetrics.maxAge} yrs</span>
                </div>
              )}

              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card-bg border border-card-border text-secondary text-xs font-mono ml-auto">
                <Users className="w-3 h-3" />
                <span>
                  {ageMetrics.recordedCount} of {ageMetrics.totalUsers} specified ({ageMetrics.completionRate}%)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chart View */}
        <div className="h-56 w-full pt-1">
          {!hasRealAgeData ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-card-border rounded-xl bg-card-bg/30 space-y-2">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <p className="text-xs font-bold text-foreground">
                No Attendee Ages Recorded Yet
              </p>
              <p className="text-[11px] text-secondary max-w-xs">
                Attendees can now select their age directly in their{" "}
                <strong className="text-foreground">Profile &gt; Demographics</strong> section. Real-time distributions will populate here.
              </p>
            </div>
          ) : viewMode === "bracket" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border)" vertical={false} />
                <XAxis
                  dataKey="bracket"
                  stroke={textColor}
                  tick={{ fill: textColor, fontSize: 10, fontWeight: "600" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={textColor}
                  tick={{ fill: textColor, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "var(--color-card-bg)",
                    borderColor: "var(--color-card-border)",
                    borderRadius: "12px",
                    color: "var(--color-foreground)",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} Attendees (${item?.payload?.percentage || 0}%)`,
                    "Count",
                  ]}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exactAgeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border)" vertical={false} />
                <XAxis
                  dataKey="age"
                  stroke={textColor}
                  tick={{ fill: textColor, fontSize: 10, fontWeight: "600" }}
                  tickLine={false}
                  axisLine={false}
                  unit="y"
                />
                <YAxis
                  stroke={textColor}
                  tick={{ fill: textColor, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "var(--color-card-bg)",
                    borderColor: "var(--color-card-border)",
                    borderRadius: "12px",
                    color: "var(--color-foreground)",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} Attendees aged ${item?.payload?.age}`,
                    "Count",
                  ]}
                />
                <Bar dataKey="count" fill="#60a5fa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-2 border-t border-card-border/40 flex items-center justify-between text-[11px] text-secondary">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-primary" />
            <span>Calculated from live attendee profile submissions</span>
          </span>
          {ageMetrics && ageMetrics.unspecifiedCount > 0 && (
            <span className="font-mono text-secondary">
              {ageMetrics.unspecifiedCount} unselected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
