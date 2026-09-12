"use client";

import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function RevenueChartsRow1({ charts }: { charts: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!charts) return null;

  const handleDrill = (key: string, value: string) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4 h-64 flex flex-col">
        <h4 className="font-semibold text-sm mb-4 text-slate-900 dark:text-white">
          Số thu theo Đơn vị (Click để Drill)
        </h4>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.byUnit || []} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={85}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-slate-600 dark:text-slate-400"
              />
              <Tooltip
                formatter={(value: any) => [
                  new Intl.NumberFormat("vi-VN").format(Number(value)) + " tỷ VNĐ",
                  "Số thu",
                ]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.5rem",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(data: any) => handleDrill("unit", data?.id || data?.payload?.id)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4 h-64 flex flex-col">
        <h4 className="font-semibold text-sm mb-4 text-slate-900 dark:text-white">Loại thuế</h4>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.byTaxType || []}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                onClick={(data: any) => handleDrill("taxType", data?.id || data?.payload?.id)}
                cursor="pointer"
              >
                {(charts.byTaxType || []).map((entry: any, index: number) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [
                  new Intl.NumberFormat("vi-VN").format(Number(value)) + " tỷ VNĐ",
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.5rem",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4 h-64 flex flex-col">
        <h4 className="font-semibold text-sm mb-4 text-slate-900 dark:text-white">6 kỳ gần nhất</h4>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.last6Periods || []}>
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-slate-600 dark:text-slate-400"
              />
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#c4b5fd" />
              <Tooltip
                formatter={(value: any) => [
                  new Intl.NumberFormat("vi-VN").format(Number(value)) + " tỷ VNĐ",
                  "Số thu",
                ]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.5rem",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
