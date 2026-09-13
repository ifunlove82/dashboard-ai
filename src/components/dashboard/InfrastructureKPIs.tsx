"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, AreaChart, Area, XAxis } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KpiItem } from "@/app/api/v1/infrastructure-fee/detailed/route";

interface InfrastructureKPIsProps {
  kpis: KpiItem[];
}

export function InfrastructureKPIs({ kpis }: InfrastructureKPIsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!kpis || kpis.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {kpis.map((item) => {
        const isPositive = item.changeType === "positive";
        const isNegative = item.changeType === "negative";
        const stroke = item.strokeColor || "#3b82f6";

        return (
          <Card
            key={item.id}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            {/* Top header: Title & Change badge */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider line-clamp-1">
                {item.title}
              </span>
              {item.change && (
                <div
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                    isPositive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60"
                      : isNegative
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800/60"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60"
                  }`}
                >
                  {isPositive && <TrendingUp className="size-3" />}
                  {isNegative && <TrendingDown className="size-3" />}
                  {!isPositive && !isNegative && <Minus className="size-3" />}
                  <span>{item.change}</span>
                </div>
              )}
            </div>

            {/* Metric Value */}
            <div className="my-1">
              <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {item.formattedValue}
              </div>
              {item.progress !== undefined && (
                <div className="mt-2 space-y-1">
                  <Progress value={item.progress} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                </div>
              )}
            </div>

            {/* Sparkline chart placed subtly under metric */}
            {(item.id === "ytd" || item.id === "current_period") && item.sparklineData && item.sparklineData.length > 0 && (
              <div className="pt-2">
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
            )}

            {/* Footnote / Context note */}
            {item.note && (
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{item.note}</span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  {item.unit}
                </span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
