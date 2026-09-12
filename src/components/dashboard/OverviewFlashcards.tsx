"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, ResponsiveContainer } from "recharts";
import { formatNumber } from "@/context/DashboardContext";
import { ArrowUpRight, ArrowDownRight, Landmark, Building2, Anchor, FileText, DollarSign, Boxes } from "lucide-react";
import type { OverviewData } from "@/app/api/stats/overview/route";

interface CardConfig {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  actualStr: string;
  actualUnit: string;
  targetPct?: number;
  targetLabel?: string;
  targetValue?: string;
  yoy: number;
  sparkline?: number[];
  sparkLabel: string;
}

export function OverviewFlashcards() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const branch = searchParams.get("branch") || "ALL";
  const loaiXNK = searchParams.get("loaiXNK") || "ALL";

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/stats/overview?branch=${branch}&loaiXNK=${loaiXNK}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Lỗi khi tải dữ liệu thẻ tổng quan`);
        }
        const json = (await res.json()) as OverviewData;
        setData(json);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error(e);
          setError(e.message || "Đã xảy ra lỗi khi tải dữ liệu thẻ tổng quan");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      controller.abort();
    };
  }, [branch, loaiXNK, retryCount]);

  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center text-slate-500">
        Đang tải thẻ tổng quan...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-40 flex flex-col items-center justify-center text-rose-500 gap-2 border border-rose-200 dark:border-rose-900/50 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 p-4 mb-6">
        <p className="text-sm font-medium">Không thể tải dữ liệu thẻ tổng quan</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error || "Không có dữ liệu"}</p>
        <button
          type="button"
          onClick={() => setRetryCount((c) => c + 1)}
          className="mt-2 text-xs px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";

  const renderBadge = (val: number) => {
    const isUp = val >= 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-full ${isUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'}`}>
        {isUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
        {isUp ? '+' : ''}{val}% YoY
      </span>
    );
  };

  const renderAreaChart = (arr: number[], id: string) => {
    if (!arr || arr.length === 0) return null;
    const chartData = arr.map((v, i) => ({ name: `T${i + 1}`, value: v }));
    return (
      <div className="h-16 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`colorBlue-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={5} />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill={`url(#colorBlue-${id})`} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderCard = ({
    id, href, title, subtitle, icon: Icon, actualStr, actualUnit, targetPct, targetLabel, targetValue, yoy, sparkline, sparkLabel
  }: CardConfig) => {
    const hasSparkline = Array.isArray(sparkline) && sparkline.length > 0;
    const latestSpark = hasSparkline ? sparkline[sparkline.length - 1] : null;

    return (
      <Link href={href}>
        <Card className="hover:border-blue-500 transition-colors cursor-pointer shadow-sm overflow-hidden h-full flex flex-col justify-between">
          <div className="p-4 pb-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
                </div>
              </div>
              {renderBadge(yoy)}
            </div>

            {/* Main Number & Progress */}
            <div className="flex items-end justify-between mb-2 mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">{actualStr}</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{actualUnit}</span>
              </div>
              {targetPct !== undefined && <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{targetPct}% kế hoạch</span>}
            </div>

            {targetPct !== undefined && (
              <>
                <Progress value={targetPct} className="h-2 mb-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-blue-600" />
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                  <span>Đạt {targetPct}% chỉ tiêu năm</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{targetLabel}: {targetValue}</span>
                </div>
              </>
            )}
          </div>

          {/* Sparkline Section */}
          <div className="pt-2">
            <div className="px-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{sparkLabel}</span>
              {latestSpark !== null && <span className="font-semibold text-blue-600 dark:text-blue-400">Tháng mới nhất: {latestSpark}</span>}
            </div>
            {hasSparkline && renderAreaChart(sparkline!, id)}
          </div>
        </Card>
      </Link>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      {renderCard({
        id: "revenue",
        href: `/dashboard/revenue${query}`,
        title: "Số thu NSNN",
        subtitle: "Lũy kế Kho bạc Nhà nước",
        icon: Landmark,
        actualStr: (data.revenue.actual / 1e9).toFixed(1),
        actualUnit: "tỷ VNĐ",
        targetPct: data.revenue.target_pct,
        targetLabel: "Pháp lệnh",
        targetValue: "1.590 tỷ VNĐ",
        yoy: data.revenue.yoy_change,
        sparkline: data.revenue.sparkline,
        sparkLabel: "Diễn biến số thu 10 tháng (T1 - T10)"
      })}

      {renderCard({
        id: "seaport_fee",
        href: `/dashboard/revenue${query}`,
        title: "Phí Cơ sở hạ tầng",
        subtitle: "Lũy kế thu phí CSHT",
        icon: Anchor,
        actualStr: (data.seaport_fee.actual / 1e9).toFixed(1),
        actualUnit: "tỷ VNĐ",
        targetPct: data.seaport_fee.target_pct,
        targetLabel: "Chỉ tiêu",
        targetValue: "5.500 tỷ VNĐ",
        yoy: data.seaport_fee.yoy_change,
        sparkline: data.seaport_fee.sparkline,
        sparkLabel: "Diễn biến thu phí các tháng"
      })}

      {renderCard({
        id: "declarations",
        href: `/dashboard/clearance${query}`,
        title: "Số lượng Tờ khai",
        subtitle: "Tổng tờ khai đã thông quan",
        icon: FileText,
        actualStr: formatNumber(data.declarations.actual),
        actualUnit: "tờ khai",
        yoy: data.declarations.yoy_change,
        sparkline: data.declarations.sparkline,
        sparkLabel: "Biến động tờ khai theo tháng"
      })}

      {renderCard({
        id: "turnover",
        href: `/dashboard/clearance${query}`,
        title: "Kim ngạch XNK",
        subtitle: "Tổng kim ngạch thống kê",
        icon: DollarSign,
        actualStr: (data.turnover.actual / 1e6).toFixed(1),
        actualUnit: "triệu USD",
        yoy: data.turnover.yoy_change,
        sparkline: data.turnover.sparkline,
        sparkLabel: "Diễn biến kim ngạch các tháng"
      })}

      {renderCard({
        id: "goods",
        href: `/dashboard/clearance${query}`,
        title: "Tổng lượng Hàng hóa",
        subtitle: `Container: ${formatNumber(data.goods.containers)}`,
        icon: Boxes,
        actualStr: formatNumber(data.goods.weight),
        actualUnit: "Tấn",
        yoy: data.goods.yoy_change,
        sparkline: data.goods.sparkline,
        sparkLabel: "Diễn biến lượng hàng"
      })}

      {renderCard({
        id: "enterprises",
        href: `/dashboard/enterprises${query}`,
        title: "Doanh nghiệp",
        subtitle: `Phát sinh mới: ${formatNumber(data.enterprises.new)} DN`,
        icon: Building2,
        actualStr: formatNumber(data.enterprises.total),
        actualUnit: "doanh nghiệp",
        yoy: data.enterprises.yoy_change,
        sparkline: data.enterprises.sparkline,
        sparkLabel: "Số lượng DN tham gia"
      })}
    </div>
  );
}
