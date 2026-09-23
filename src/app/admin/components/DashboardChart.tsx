"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function DashboardChart({ data }: { data: any[] }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-[400px] animate-pulse bg-foreground/5 rounded-xl"></div>;

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke={resolvedTheme === 'dark' ? '#888888' : '#666666'}
            tick={{ fill: resolvedTheme === 'dark' ? '#888888' : '#666666', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            dy={10}
            minTickGap={20}
          />
          <YAxis 
            stroke={resolvedTheme === 'dark' ? '#888888' : '#666666'}
            tick={{ fill: resolvedTheme === 'dark' ? '#888888' : '#666666', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-card-border)',
              borderRadius: '12px',
              color: 'var(--color-foreground)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
            formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Revenue']}
            labelStyle={{ color: 'var(--color-foreground)', fontWeight: 'bold', marginBottom: '8px' }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="var(--color-primary)" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
