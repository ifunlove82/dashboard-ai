"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  FileText,
  DollarSign,
  Briefcase,
  Boxes,
  Truck,
  Sparkles,
  Printer,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Award,
  Globe2,
} from "lucide-react";

// Helper for inline bold parsing
function renderInline(text: string) {
  const parts = text.split("**");
  return parts.map((part, pIdx) =>
    pIdx % 2 === 1 ? (
      <strong key={pIdx} className="font-semibold text-slate-900 dark:text-slate-100">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

// Helper for simple custom markdown rendering
function renderMarkdown(text: string) {
  if (!text) return null;
  return text.split("\n").map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={idx} className="text-lg font-bold mt-4 mb-2 text-primary border-b pb-1">
          {trimmed.replace("### ", "")}
        </h3>
      );
    }
    if (trimmed.startsWith("#### ")) {
      return (
        <h4 key={idx} className="text-md font-semibold mt-3 mb-1 text-slate-800 dark:text-slate-200">
          {trimmed.replace("#### ", "")}
        </h4>
      );
    }
    if (trimmed.startsWith("- ")) {
      return (
        <li key={idx} className="ml-6 list-disc mb-1 text-slate-600 dark:text-slate-400">
          {renderInline(trimmed.replace("- ", ""))}
        </li>
      );
    }
    if (trimmed.startsWith("* ")) {
      return (
        <li key={idx} className="ml-6 list-disc mb-1 italic text-slate-500">
          {trimmed.replace("* ", "")}
        </li>
      );
    }
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      return (
        <p key={idx} className="font-bold my-1 text-slate-700 dark:text-slate-300">
          {trimmed.replace(/\*\*/g, "")}
        </p>
      );
    }
    if (trimmed === "---") {
      return <hr key={idx} className="my-4 border-slate-200 dark:border-slate-800" />;
    }
    if (trimmed) {
      return (
        <p key={idx} className="my-1.5 text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
          {renderInline(trimmed)}
        </p>
      );
    }
    return <div key={idx} className="h-1.5" />;
  });
}

// Format numbers
const formatUSD = (val: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
};

const formatVND = (val: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(val);
};

const formatNumber = (val: number) => {
  return new Intl.NumberFormat("vi-VN").format(val);
};

export default function DashboardPage() {
  const [loaiXNK, setLoaiXNK] = useState<string>("ALL");
  const [datePreset, setDatePreset] = useState<string>("first-half-2026");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<"connecting" | "live" | "fallback">("connecting");

  const reportRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Determine actual dates based on preset
  const getDateRange = (preset: string) => {
    switch (preset) {
      case "q1-2026":
        return { start: "2026-01-01", end: "2026-03-31" };
      case "q2-2026":
        return { start: "2026-04-01", end: "2026-06-30" };
      case "first-half-2026":
      default:
        return { start: "2026-01-01", end: "2026-06-30" };
    }
  };

  const { start: startDate, end: endDate } = getDateRange(datePreset);

  // Clear typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  // Run AI analysis with optional target dataset
  const runAiAnalysis = useCallback(async (currentStats?: any) => {
    const target = currentStats || stats;
    if (!target) return;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    setAiLoading(true);
    setAiInsight("");
    try {
      const res = await fetch("/api/ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target),
      });
      const data = await res.json();
      const fullText = data.insight || "";

      let currentIdx = 0;
      const step = 8;
      typingIntervalRef.current = setInterval(() => {
        currentIdx += step;
        if (currentIdx >= fullText.length) {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setAiInsight(fullText);
        } else {
          setAiInsight(fullText.substring(0, currentIdx));
        }
      }, 30);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAiInsight("### Có lỗi xảy ra trong quá trình gọi API AI. Vui lòng kiểm tra kết nối mạng hoặc khoá Gemini API.");
    } finally {
      setAiLoading(false);
    }
  }, [stats]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setAiInsight(""); // Clear previous insight when filter criteria change
    try {
      const res = await fetch(
        `/api/stats?startDate=${startDate}&endDate=${endDate}&loaiXNK=${loaiXNK}`
      );
      const data = await res.json();
      setStats(data);
      setDbStatus(data.isMock ? "fallback" : "live");
      // Trigger fresh analysis automatically on new data
      runAiAnalysis(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setDbStatus("fallback");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, loaiXNK, runAiAnalysis]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Export A4 PDF via Native Print (Save as PDF)
  const handleExportPDF = () => {
    window.print();
  };

  const getTaxPieData = () => {
    if (!stats || !stats.taxBreakdown) return [];
    const tb = stats.taxBreakdown;
    return [
      { name: "Thuế XNK", value: tb.thueXNK, color: "#3B82F6" },
      { name: "Thuế VAT (V)", value: tb.thueV, color: "#10B981" },
      { name: "Thuế TTĐB (T)", value: tb.thueT, color: "#F59E0B" },
      { name: "Thuế BVMT (M)", value: tb.thueM, color: "#8B5CF6" },
      { name: "Thuế Tự vệ (B)", value: tb.thueB, color: "#EF4444" },
      { name: "Thuế Khác (G)", value: tb.thueG, color: "#EC4899" },
      { name: "Thuế thu khác", value: tb.thueKhac, color: "#6B7280" },
    ].filter((item) => item.value > 0);
  };

  const getChannelData = () => {
    if (!stats || !stats.channels) return [];
    return stats.channels;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Sidebar - Hidden on print */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shrink-0 hidden md:flex print:hidden">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-md">
              <Globe2 className="size-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-slate-950 dark:text-white">VNACCS Analytics</h1>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hệ thống phân tích Hải quan</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-2 mb-2">Chức năng</h2>
            <Button variant="default" className="w-full justify-start gap-2 shadow-sm">
              <TrendingUp className="size-4" />
              Tổng quan chỉ số
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 dark:text-slate-300">
              <Boxes className="size-4" />
              Cơ cấu hàng hóa
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 dark:text-slate-300">
              <Briefcase className="size-4" />
              Top Doanh nghiệp
            </Button>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-2">Trạng thái CSDL</h2>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Kết nối:</span>
                <span className="font-semibold flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${dbStatus === "live" ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"}`} />
                  {dbStatus === "live" ? "SQL Server Live" : "Dữ liệu Mẫu"}
                </span>
              </div>
              <p className="text-[10px] leading-normal text-slate-400 dark:text-slate-500">
                {dbStatus === "live" 
                  ? "Đang đọc trực tiếp dữ liệu cấu trúc Table.sql từ CSDL của bạn." 
                  : "Chưa kết nối được SQL Server. Chạy ở chế độ Demo với dữ liệu giả lập hải quan."
                }
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          <span>Phiên bản v1.2.0 (Tailwind v4)</span>
        </div>
      </aside>

      {/* Main Dashboard Container */}
      <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto print:p-0">
        
        {/* Actions panel - Hidden on print */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Thống kê hoạt động Hải quan & XNK</h2>
            <p className="text-slate-500 dark:text-slate-400">Phân tích chuyên sâu cơ cấu các chỉ số giao dịch, thuế quan và nhận định AI</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Range selection */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
              <Calendar className="size-4 text-slate-400 ml-1" />
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="bg-transparent text-sm font-medium border-0 focus:ring-0 outline-none pr-6 cursor-pointer"
              >
                <option value="first-half-2026">6 Tháng đầu năm 2026</option>
                <option value="q1-2026">Quý 1 / 2026</option>
                <option value="q2-2026">Quý 2 / 2026</option>
              </select>
            </div>

            {/* Type selection */}
            <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
              <Button
                variant={loaiXNK === "ALL" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLoaiXNK("ALL")}
                className="text-xs"
              >
                Tất cả
              </Button>
              <Button
                variant={loaiXNK === "NK" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLoaiXNK("NK")}
                className="text-xs"
              >
                Nhập khẩu (NK)
              </Button>
              <Button
                variant={loaiXNK === "XK" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLoaiXNK("XK")}
                className="text-xs"
              >
                Xuất khẩu (XK)
              </Button>
            </div>

            {/* AI analysis */}
            <Button
              variant="outline"
              size="sm"
              onClick={runAiAnalysis}
              disabled={aiLoading}
              className="gap-1.5 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-950 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
            >
              <Sparkles className={`size-4 ${aiLoading ? "animate-spin" : ""}`} />
              Phân tích AI
            </Button>

            {/* PDF export */}
            <Button
              onClick={handleExportPDF}
              size="sm"
              className="gap-1.5 shadow-sm"
            >
              <Printer className="size-4" />
              Xuất PDF
            </Button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && !stats ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <RefreshCw className="size-8 text-primary animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">Đang tải và đồng bộ dữ liệu Hải quan...</p>
          </div>
        ) : (
          /* Report Document Wrapper (Print Target) */
          <div ref={reportRef} id="report-container" className="space-y-6">
            
            {/* Header visible in PDF export & Print */}
            <div className="pdf-report-header pb-4 border-b border-slate-300">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-slate-950">BÁO CÁO THỐNG KÊ HOẠT ĐỘNG HẢI QUAN & XNK</h1>
                  <p className="text-xs text-slate-500">
                    Phạm vi: {datePreset === "first-half-2026" ? "6 tháng đầu năm 2026" : datePreset === "q1-2026" ? "Quý 1/2026" : "Quý 2/2026"} | 
                    Loại hình: {loaiXNK === "ALL" ? "Tất cả xuất nhập khẩu" : loaiXNK === "NK" ? "Nhập khẩu" : "Xuất khẩu"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-slate-900">VNACCS AI REPORT</div>
                  <div className="text-[10px] text-slate-400">Thời gian tạo: {new Date().toLocaleDateString("vi-VN")}</div>
                </div>
              </div>
            </div>

            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-xs border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng số tờ khai</CardTitle>
                  <FileText className="size-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight">{formatNumber(stats?.kpis?.totalDeclarations || 0)}</div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Lượt giao dịch thông quan</span>
                </CardContent>
              </Card>

              <Card className="shadow-xs border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kim ngạch (USD)</CardTitle>
                  <DollarSign className="size-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                    {formatUSD(stats?.kpis?.totalValueUSD || 0)}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Tổng giá trị khai báo</span>
                </CardContent>
              </Card>

              <Card className="shadow-xs border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số thuế đã thu (VND)</CardTitle>
                  <Award className="size-4 text-violet-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight text-violet-600 dark:text-violet-400">
                    {formatVND(stats?.kpis?.totalTaxVND || 0)}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Đóng góp ngân sách</span>
                </CardContent>
              </Card>

              <Card className="shadow-xs border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vận chuyển & Trọng lượng</CardTitle>
                  <Truck className="size-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight">
                    {formatNumber(stats?.kpis?.totalContainers || 0)} Cont
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    Trọng lượng: {formatNumber(Math.round(stats?.kpis?.totalWeightTNE || 0))} Tấn
                  </span>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1: Trends & Tax Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Trend Chart (Spans 2 cols) */}
              <Card className="lg:col-span-2 shadow-xs border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 page-break-avoid">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <TrendingUp className="size-4 text-blue-500" />
                    Xu hướng Kim ngạch & Thuế theo thời gian
                  </CardTitle>
                  <CardDescription className="text-xs">Trị giá XNK (USD) so với Số thuế hải quan đã thu (VND)</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stats?.trends || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis yAxisId="left" stroke="#3B82F6" fontSize={10} tickLine={false} tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
                      <YAxis yAxisId="right" orientation="right" stroke="#8B5CF6" fontSize={10} tickLine={false} tickFormatter={(v) => `${(v / 1e9).toFixed(0)}B`} />
                      <Tooltip 
                        formatter={(value: any, name: any) => {
                          if (name === "Kim ngạch (USD)") return [formatUSD(value), name];
                          return [formatVND(value), name];
                        }}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
                      <Area yAxisId="left" type="monotone" dataKey="valueUSD" name="Kim ngạch (USD)" fill="#3B82F6" fillOpacity={0.08} stroke="#3B82F6" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="taxVND" name="Thuế thu được (VND)" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tax Allocation Donut Chart */}
              <Card className="shadow-xs border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 page-break-avoid">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Award className="size-4 text-violet-500" />
                    Cơ cấu các khoản thu Thuế quan
                  </CardTitle>
                  <CardDescription className="text-xs">Tỷ lệ đóng góp của từng sắc thuế hải quan</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex flex-col justify-between">
                  <div className="h-56 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getTaxPieData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {getTaxPieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatVND(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Tổng cộng</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-white block">
                        {stats?.kpis?.totalTaxVND ? `${(stats.kpis.totalTaxVND / 1e12).toFixed(2)}T VND` : "0"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Legend list */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-semibold pl-2">
                    {getTaxPieData().slice(0, 6).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate text-slate-500 dark:text-slate-400">{item.name}:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {stats?.kpis?.totalTaxVND ? `${((item.value / stats.kpis.totalTaxVND) * 100).toFixed(0)}%` : "0%"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Charts Row 2: Commodities & Channels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Commodities horizontal bars */}
              <Card className="lg:col-span-2 shadow-xs border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 page-break-avoid">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Boxes className="size-4 text-emerald-500" />
                    Top 5 nhóm hàng hóa có trị giá lớn nhất
                  </CardTitle>
                  <CardDescription className="text-xs">Trị giá giao dịch VND và Số lượng tương ứng</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(stats?.commodities || []).slice(0, 5)}
                      layout="vertical"
                      margin={{ left: 20, right: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                      <XAxis type="number" stroke="#94A3B8" fontSize={9} tickFormatter={(v) => `${(v / 1e12).toFixed(1)}T`} />
                      <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={9} width={100} tickFormatter={(v) => v.length > 20 ? `${v.substring(0, 20)}...` : v} />
                      <Tooltip formatter={(value: any) => formatVND(value)} />
                      <Bar dataKey="valueVND" name="Trị giá (VND)" fill="#10B981" radius={[0, 4, 4, 0]} barSize={15} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Channels (Phân luồng) Donut */}
              <Card className="shadow-xs border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 page-break-avoid">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <AlertTriangle className="size-4 text-amber-500" />
                    Cơ cấu Tỷ lệ phân luồng tờ khai
                  </CardTitle>
                  <CardDescription className="text-xs">Đánh giá mức độ thông quan và quản lý rủi ro</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex flex-col justify-between">
                  <div className="h-56 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getChannelData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {getChannelData().map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value} Tờ khai`, "Số lượng"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Tờ khai</span>
                      <span className="text-md font-extrabold text-slate-800 dark:text-white block">
                        {stats?.kpis?.totalDeclarations ? formatNumber(stats.kpis.totalDeclarations) : "0"}
                      </span>
                    </div>
                  </div>

                  {/* Channel Legend */}
                  <div className="flex justify-around text-xs font-bold pb-2">
                    {getChannelData().map((item: any, idx: number) => (
                      <div key={idx} className="text-center">
                        <span className="inline-block size-2 rounded-full mr-1" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{item.name}</span>
                        <span className="text-slate-800 dark:text-white text-xs block">
                          {stats?.kpis?.totalDeclarations ? `${((item.value / stats.kpis.totalDeclarations) * 100).toFixed(1)}%` : "0%"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* AI Insights glow container */}
            <Card className="shadow-lg border border-indigo-150 dark:border-indigo-950/80 bg-gradient-to-br from-indigo-50/20 via-white to-violet-50/10 dark:from-indigo-950/10 dark:via-slate-900 dark:to-slate-950 page-break-avoid">
              <CardHeader className="pb-1 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-extrabold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                    <div className="p-1 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                      <Sparkles className="size-5 animate-pulse" />
                    </div>
                    Nhận định & Đánh giá rủi ro từ Trợ lý AI
                  </CardTitle>
                  {aiLoading && (
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <RefreshCw className="size-3 animate-spin" />
                      AI đang suy nghĩ...
                    </span>
                  )}
                </div>
                <CardDescription className="text-xs">Phân tích rủi ro, phân bổ thuế và dự báo dựa trên mô hình trí tuệ nhân tạo Gemini</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 px-6 max-h-[450px] overflow-y-auto print:max-h-none print:overflow-visible">
                {aiInsight ? (
                  <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                    {renderMarkdown(aiInsight)}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 space-y-3">
                    <Sparkles className="size-10 text-indigo-300 dark:text-indigo-800 animate-bounce" />
                    <p className="text-xs text-slate-400 font-medium">Bấm nút &quot;Phân tích AI&quot; ở góc trên để bắt đầu nhận định tự động.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enterprises list Table */}
            <Card className="shadow-xs border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 page-break-avoid">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Globe2 className="size-4 text-sky-500" />
                  Top 10 Doanh nghiệp hoạt động năng động nhất
                </CardTitle>
                <CardDescription className="text-xs">Theo tổng kim ngạch xuất nhập khẩu quy đổi USD</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold">
                        <th className="py-2.5 px-4">Mã số thuế</th>
                        <th className="py-2.5 px-4">Tên Doanh nghiệp</th>
                        <th className="py-2.5 px-4 text-right">Kim ngạch (USD)</th>
                        <th className="py-2.5 px-4 text-center">Tờ khai</th>
                        <th className="py-2.5 px-4 text-center">Số Cont</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(stats?.enterprises || []).map((ent: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-medium transition-colors">
                          <td className="py-2.5 px-4 font-mono text-slate-500">{ent.taxId}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200 uppercase">{ent.name}</td>
                          <td className="py-2.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">{formatUSD(ent.valueUSD)}</td>
                          <td className="py-2.5 px-4 text-center">{formatNumber(ent.declarations)}</td>
                          <td className="py-2.5 px-4 text-center font-bold">{formatNumber(ent.containers)}</td>
                        </tr>
                      ))}
                      {(stats?.enterprises || []).length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-slate-400">Không có dữ liệu hiển thị.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </main>

      {/* Global CSS style for PDF generation and print layout */}
      <style jsx global>{`
        .pdf-report-header {
          display: none;
        }
        .print-pdf-mode {
          padding: 12px !important;
          margin: 0 auto !important;
          max-width: 210mm !important;
          background-color: #ffffff !important;
          color: #0f172a !important;
        }
        .print-pdf-mode .pdf-report-header {
          display: block !important;
        }
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .pdf-report-header {
            display: block !important;
          }
          .page-break-avoid {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
