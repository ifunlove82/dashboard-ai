"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, AreaChart, Area, XAxis } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Activity,
  Landmark,
  FileText,
  Target,
  PieChart
} from "lucide-react";
import type { KpiItem } from "@/app/api/v1/infrastructure-fee/detailed/route";

interface InfrastructureKPIsProps {
  kpis: KpiItem[];
}

const getIcon = (id: string) => {
  switch (id) {
    case "current_period": return Activity;
    case "ytd": return Landmark;
    case "yoy": return TrendingUp;
    case "previous_period": return FileText;
    case "target": return Target;
    case "completion": return PieChart;
    default: return Activity;
  }
};

export function InfrastructureKPIs({ kpis }: InfrastructureKPIsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!kpis || kpis.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      {kpis.map((item) => {
        const isPositive = item.changeType === "positive";
        const isNegative = item.changeType === "negative";
        const stroke = item.strokeColor || "#3b82f6";
        const Icon = getIcon(item.id);
        const hasSparkline = (item.id === "ytd" || item.id === "current_period") && item.sparklineData && item.sparklineData.length > 0;
        const latestSpark = hasSparkline ? item.sparklineData[item.sparklineData.length - 1].value : null;

        return (
          <Card
            key={item.id}
            className="hover:border-blue-500 transition-colors cursor-pointer shadow-sm overflow-hidden h-full flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl"
          >
            <div className="p-4 pb-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.note || "Thống kê"}</p>
                  </div>
                </div>
                {item.change && (
                  <div
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                      isPositive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : isNegative
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {isPositive ? <TrendingUp className="size-3" /> : isNegative ? <TrendingDown className="size-3" /> : <Minus className="size-3" />}
                    <span>{item.change}</span>
                  </div>
                )}
              </div>

              {/* Main Number & Progress */}
              <div className="flex items-end justify-between mb-2 mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                    {item.formattedValue}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.unit}</span>
                </div>
                {item.progress !== undefined && (
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{item.progress}% hoàn thành</span>
                )}
              </div>

              {item.progress !== undefined && (
                <>
                  <Progress value={item.progress} className="h-2 mb-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-blue-600" />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                    <span>Đạt {item.progress}% kế hoạch</span>
                  </div>
                </>
              )}
            </div>

            {/* Sparkline Section */}
            {hasSparkline ? (
              <div className="pt-2">
                <div className="px-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Biến động (12 kỳ)</span>
                  {latestSpark !== null && <span className="font-semibold text-blue-600 dark:text-blue-400">Kỳ mới nhất: {latestSpark}</span>}
                </div>
                <div className="h-14 w-full mt-2 relative overflow-hidden">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={item.sparklineData.map((d, i) => ({ name: `T${i + 1}`, value: d.value }))}
                        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                      >
                        <defs>
                          <linearGradient id={`colorBlue-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={stroke} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={stroke} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={5} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={stroke}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill={`url(#colorBlue-${item.id})`}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full bg-slate-50 dark:bg-slate-800/40 rounded animate-pulse" />
                  )}
                </div>
              </div>
            ) : (
              <div className="pb-4"></div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
