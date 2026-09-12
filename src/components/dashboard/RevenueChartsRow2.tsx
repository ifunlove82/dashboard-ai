"use client";

import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export function RevenueChartsRow2({ charts }: { charts: any }) {
  if (!charts) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Biểu đồ 1: Tương quan Kim ngạch - Thu */}
      <Card className="p-4 h-64 flex flex-col">
        <h4 className="font-semibold text-sm mb-4 text-slate-900 dark:text-white">
          Tương quan Kim ngạch - Thu
        </h4>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={charts.correlation || []}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-slate-600 dark:text-slate-400"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-slate-600 dark:text-slate-400"
              />
              <Tooltip
                formatter={(value: any, name: any) => {
                  const label =
                    name === "turnover"
                      ? "Kim ngạch"
                      : name === "revenue"
                      ? "Số thu"
                      : name;
                  const unit = name === "turnover" ? " triệu USD" : " tỷ VNĐ";
                  return [
                    new Intl.NumberFormat("vi-VN").format(Number(value)) + unit,
                    label,
                  ];
                }}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.5rem",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: "11px", paddingBottom: "4px" }}
                formatter={(value: string) =>
                  value === "turnover"
                    ? "Kim ngạch"
                    : value === "revenue"
                    ? "Số thu"
                    : value
                }
              />
              <Bar
                dataKey="turnover"
                name="turnover"
                fill="#94a3b8"
                radius={[3, 3, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Biểu đồ 2: Số thu theo XK/NK */}
      <Card className="p-4 h-64 flex flex-col">
        <h4 className="font-semibold text-sm mb-4 text-slate-900 dark:text-white">
          Số thu theo XK/NK
        </h4>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.byImportExport || []}
                dataKey="value"
                nameKey="name"
                innerRadius={0}
                outerRadius={75}
                cx="50%"
                cy="50%"
                labelLine={false}
              >
                {(charts.byImportExport || []).map((entry: any, index: number) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${value}%`,
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
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Danh sách 3: Nhóm hàng */}
      <Card className="p-4 h-64 flex flex-col">
        <h4 className="font-semibold text-sm mb-4 text-slate-900 dark:text-white">
          Nhóm hàng
        </h4>
        <div className="flex-1 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800">
          {(charts.byCommodityGroup || []).map((c: any) => (
            <div
              key={c.name}
              className="flex justify-between items-center py-2.5 text-sm"
            >
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {c.name}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {new Intl.NumberFormat("vi-VN").format(Number(c.value))} tỷ VNĐ
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
