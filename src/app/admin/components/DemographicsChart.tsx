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
import { Users, Sparkles } from "lucide-react";

interface DemographicsProps {
  genderData: { name: string; value: number }[];
  ageData: { bracket: string; count: number }[];
}

const GENDER_COLORS = ["#ffe17c", "#60a5fa", "#f472b6", "#a78bfa", "#94a3b8"];

export default function DemographicsChart({ genderData, ageData }: DemographicsProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-72 animate-pulse bg-foreground/5 rounded-2xl" />;
  }

  const textColor = resolvedTheme === "dark" ? "#a3a3a3" : "#525252";

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

      {/* Age Bracket Distribution */}
      <div className="bg-card-bg/60 border border-card-border p-6 rounded-2xl backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="font-anton text-xl uppercase tracking-wider text-foreground">
              Age Group Demographics
            </h4>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-foreground/10 text-foreground/70">
            Age Brackets
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border)" vertical={false} />
              <XAxis
                dataKey="bracket"
                stroke={textColor}
                tick={{ fill: textColor, fontSize: 11, fontWeight: "600" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={textColor}
                tick={{ fill: textColor, fontSize: 11 }}
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
                }}
                formatter={(value: any) => [`${value} Registered`, "Attendees"]}
              />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
