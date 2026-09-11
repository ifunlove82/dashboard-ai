"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Moon,
  Sun,
  Search,
  Copy,
  Check,
  ShieldCheck,
  BarChart3,
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

// Helper for custom markdown rendering
function renderMarkdown(text: string) {
  if (!text) return null;
  return text.split("\n").map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={idx}
          className="text-base md:text-lg font-bold mt-5 mb-2 text-indigo-700 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-950/60 pb-1 flex items-center gap-2"
        >
          <BarChart3 className="size-4 text-indigo-500 shrink-0" />
          {trimmed.replace("### ", "")}
        </h3>
      );
    }
    if (trimmed.startsWith("#### ")) {
      return (
        <h4
          key={idx}
          className="text-sm md:text-base font-semibold mt-3 mb-1 text-slate-800 dark:text-slate-200"
        >
          {trimmed.replace("#### ", "")}
        </h4>
      );
    }
    if (trimmed.startsWith("- ")) {
      return (
        <li key={idx} className="ml-5 list-disc mb-1 text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed">
          {renderInline(trimmed.replace("- ", ""))}
        </li>
      );
    }
    if (trimmed.startsWith("* ")) {
      return (
        <li key={idx} className="ml-5 list-disc mb-1 italic text-slate-500 dark:text-slate-400 text-xs md:text-sm">
          {trimmed.replace("* ", "")}
        </li>
      );
    }
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      return (
        <p key={idx} className="font-bold my-1 text-slate-800 dark:text-slate-200 text-xs md:text-sm">
          {trimmed.replace(/\*\*/g, "")}
        </p>
      );
    }
    if (trimmed === "---") {
      return <hr key={idx} className="my-3 border-slate-200 dark:border-slate-800" />;
    }
    if (trimmed) {
      return (
        <p key={idx} className="my-1.5 text-slate-600 dark:text-slate-300 leading-relaxed text-xs md:text-sm">
          {renderInline(trimmed)}
        </p>
      );
    }
    return <div key={idx} className="h-1" />;
  });
}

// Currency & Number Formatters
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
  const [isDark, setIsDark] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const reportRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize theme mode
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

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
    setAiInsight(""); // Clear previous insight on filter change
    try {
      const res = await fetch(
        `/api/stats?startDate=${startDate}&endDate=${endDate}&loaiXNK=${loaiXNK}`
      );
      const data = await res.json();
      setStats(data);
      setDbStatus(data.isMock ? "fallback" : "live");
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

  // Export A4 PDF via Native Print
  const handleExportPDF = () => {
    window.print();
  };

  // Copy AI report
  const handleCopyInsight = () => {
    if (!aiInsight) return;
    navigator.clipboard.writeText(aiInsight);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tax Breakdown Data
  const taxPieData = useMemo(() => {
    if (!stats || !stats.taxBreakdown) return [];
    const tb = stats.taxBreakdown;
    return [
      { name: "Thuế GTGT (VAT)", value: tb.thueV, color: "#10B981" },
      { name: "Thuế Xuất Nhập Khẩu", value: tb.thueXNK, color: "#3B82F6" },
      { name: "Thuế Tiêu thụ đặc biệt", value: tb.thueT, color: "#F59E0B" },
      { name: "Thuế Bảo vệ môi trường", value: tb.thueM, color: "#8B5CF6" },
      { name: "Thuế Tự vệ / Chống BPG", value: tb.thueB, color: "#EF4444" },
      { name: "Thuế Khác & Thuế thu khác", value: tb.thueG + tb.thueKhac, color: "#64748B" },
    ].filter((item) => item.value > 0);
  }, [stats]);

  // Channels Data
  const channelData = useMemo(() => {
    if (!stats || !stats.channels) return [];
    return stats.channels;
  }, [stats]);

  // Filtered Enterprises
  const filteredEnterprises = useMemo(() => {
    if (!stats || !stats.enterprises) return [];
    if (!searchQuery.trim()) return stats.enterprises;
    const q = searchQuery.toLowerCase().trim();
    return stats.enterprises.filter(
      (ent: any) =>
        (ent.name && ent.name.toLowerCase().includes(q)) ||
        (ent.taxId && ent.taxId.includes(q))
    );
  }, [stats, searchQuery]);

  return (
    <div className="flex min-h-screen bg-slate-100/70 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased">
      {/* Sidebar - Collapsible on small, fixed on large */}
      <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 p-5 flex flex-col justify-between shrink-0 hidden lg:flex print:hidden shadow-xs">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                VNACCS Intel
              </h1>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 block leading-tight">
                Phân tích Hải quan & XNK
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
              Bảng điều khiển
            </span>
            <Button
              variant="default"
              size="sm"
              className="w-full justify-start gap-2.5 font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <TrendingUp className="size-4" />
              Tổng quan chỉ số
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2.5 font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <Boxes className="size-4" />
              Cơ cấu hàng hóa
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2.5 font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <Briefcase className="size-4" />
              Doanh nghiệp XNK
            </Button>
          </div>

          {/* Database Connection Status Card */}
          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
              Nguồn dữ liệu
            </span>
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Trạng thái:</span>
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  <span
                    className={`size-2 rounded-full ${
                      dbStatus === "live"
                        ? "bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"
                        : "bg-amber-500 animate-pulse ring-4 ring-amber-500/20"
                    }`}
                  />
                  {dbStatus === "live" ? "SQL Server Live" : "Dữ liệu Demo"}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {dbStatus === "live"
                  ? "Đang truy vấn trực tiếp CSDL VNACCS_REPORT."
                  : "Chạy dữ liệu mô phỏng nghiệp vụ Hải quan VN."}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">Next.js 16 • Tailwind v4</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
            PRO
          </span>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-[1600px] mx-auto w-full print:p-0 print:max-w-none">
        
        {/* Top Header & Filter Controls (Hidden in print) */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800 print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                Data-Dense Analytics
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Hệ thống chỉ số Hải quan điện tử
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Tổng quan Hoạt động Hải quan & Thương mại XNK
            </h2>
          </div>

          {/* Action & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Preset Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <Calendar className="size-4 text-slate-400 shrink-0" />
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 border-0 focus:ring-0 outline-none cursor-pointer pr-4"
              >
                <option value="first-half-2026">6 Tháng đầu năm 2026</option>
                <option value="q1-2026">Quý 1 / 2026</option>
                <option value="q2-2026">Quý 2 / 2026</option>
              </select>
            </div>

            {/* Regime Type Buttons */}
            <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <Button
                variant={loaiXNK === "ALL" ? "default" : "ghost"}
                size="xs"
                onClick={() => setLoaiXNK("ALL")}
                className={`text-xs px-2.5 py-1 ${
                  loaiXNK === "ALL"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Tất cả
              </Button>
              <Button
                variant={loaiXNK === "NK" ? "default" : "ghost"}
                size="xs"
                onClick={() => setLoaiXNK("NK")}
                className={`text-xs px-2.5 py-1 ${
                  loaiXNK === "NK"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Nhập khẩu (NK)
              </Button>
              <Button
                variant={loaiXNK === "XK" ? "default" : "ghost"}
                size="xs"
                onClick={() => setLoaiXNK("XK")}
                className={`text-xs px-2.5 py-1 ${
                  loaiXNK === "XK"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Xuất khẩu (XK)
              </Button>
            </div>

            {/* AI Re-Analyze Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => runAiAnalysis()}
              disabled={aiLoading}
              className="gap-1.5 text-xs font-semibold border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900/60 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 shadow-2xs"
            >
              <Sparkles className={`size-3.5 ${aiLoading ? "animate-spin" : ""}`} />
              Phân tích AI
            </Button>

            {/* Native Print / PDF Button */}
            <Button
              onClick={handleExportPDF}
              size="sm"
              className="gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-2xs"
            >
              <Printer className="size-3.5" />
              In / Xuất PDF
            </Button>

            {/* Dark / Light Mode Switcher */}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={toggleTheme}
              title={isDark ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
              className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-700" />}
            </Button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && !stats ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <RefreshCw className="size-9 text-blue-600 animate-spin" />
            <p className="text-sm text-slate-500 font-medium animate-pulse">
              Đang đồng bộ số liệu Hải quan từ hệ thống...
            </p>
          </div>
        ) : (
          /* Report Document Wrapper (Print Target) */
          <div ref={reportRef} id="report-container" className="space-y-6">
            
            {/* Header visible in PDF / Print Mode */}
            <div className="pdf-report-header pb-4 border-b border-slate-300">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                    BÁO CÁO THỐNG KÊ HOẠT ĐỘNG HẢI QUAN & THƯƠNG MẠI XNK
                  </h1>
                  <p className="text-xs text-slate-600 mt-1">
                    Thời gian: {datePreset === "first-half-2026" ? "6 tháng đầu năm 2026" : datePreset === "q1-2026" ? "Quý 1/2026" : "Quý 2/2026"} | 
                    Loại hình: {loaiXNK === "ALL" ? "Toàn bộ Xuất Nhập Khẩu" : loaiXNK === "NK" ? "Nhập khẩu (NK)" : "Xuất khẩu (XK)"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-blue-800">VNACCS CUSTOMS INTEL</div>
                  <div className="text-[10px] text-slate-500">Ngày lập: {new Date().toLocaleDateString("vi-VN")}</div>
                </div>
              </div>
            </div>

            {/* 1. Refined KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
              
              {/* Total Declarations */}
              <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    Tổng số tờ khai
                  </span>
                  <div className="size-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                    <FileText className="size-3.5" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3.5 pt-0">
                  <div className="text-2xl font-black tracking-tight tabular-nums text-slate-900 dark:text-white">
                    {formatNumber(stats?.kpis?.totalDeclarations || 0)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium">Tỷ lệ luồng xanh:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {stats?.kpis?.totalDeclarations && stats?.channels
                        ? `${(
                            ((stats.channels.find((c: any) => c.name.includes("Xanh"))?.value || 0) /
                              stats.kpis.totalDeclarations) *
                            100
                          ).toFixed(1)}%`
                        : "65%"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Total USD Value */}
              <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-700 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    Kim ngạch XNK
                  </span>
                  <div className="size-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="size-3.5" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3.5 pt-0">
                  <div className="text-2xl font-black tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatUSD(stats?.kpis?.totalValueUSD || 0)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium">Quy đổi VND:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {stats?.kpis?.totalValueUSD
                        ? `${((stats.kpis.totalValueUSD * 25000) / 1e12).toFixed(1)}T VND`
                        : "0"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Total Tax Revenue */}
              <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs hover:border-violet-400 dark:hover:border-violet-700 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    Thuế Hải quan đã thu
                  </span>
                  <div className="size-7 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center">
                    <Award className="size-3.5" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3.5 pt-0">
                  <div className="text-2xl font-black tracking-tight tabular-nums text-violet-600 dark:text-violet-400">
                    {formatVND(stats?.kpis?.totalTaxVND || 0)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium">Tỷ lệ thu thuế / Trị giá:</span>
                    <span className="font-bold text-violet-700 dark:text-violet-300">
                      {stats?.kpis?.totalTaxVND && stats?.kpis?.totalValueUSD
                        ? `${((stats.kpis.totalTaxVND / (stats.kpis.totalValueUSD * 25000)) * 100).toFixed(2)}%`
                        : "0%"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Volume & Weight */}
              <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs hover:border-amber-400 dark:hover:border-amber-700 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    Vận chuyển & Container
                  </span>
                  <div className="size-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                    <Truck className="size-3.5" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3.5 pt-0">
                  <div className="text-2xl font-black tracking-tight tabular-nums text-slate-900 dark:text-white">
                    {formatNumber(stats?.kpis?.totalContainers || 0)}{" "}
                    <span className="text-sm font-semibold text-slate-400 font-sans">Cont</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Trọng lượng hàng:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {formatNumber(Math.round(stats?.kpis?.totalWeightTNE || 0))} Tấn
                    </span>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* 2. Charts Section - Row 1: Trend & Tax Distribution */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              
              {/* Trend Chart (8 Columns) */}
              <Card className="xl:col-span-8 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs page-break-avoid">
                <CardHeader className="pb-2 pt-4 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                        <TrendingUp className="size-4 text-blue-600" />
                        Xu hướng Kim ngạch & Thu ngân sách theo chuỗi thời gian
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Tương quan giữa Kim ngạch XNK (USD) và Số thuế hải quan đã thu (VND)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-80 px-2 pb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stats?.trends || []}>
                      <defs>
                        <linearGradient id="usdGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={isDark ? "#1E293B" : "#F1F5F9"}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#94A3B8"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#3B82F6"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#8B5CF6"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1e9).toFixed(0)}B`}
                      />
                      <Tooltip
                        formatter={(value: any, name: any) => {
                          if (name === "Kim ngạch (USD)") return [formatUSD(value), name];
                          return [formatVND(value), name];
                        }}
                        contentStyle={{
                          borderRadius: "10px",
                          backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                          border: isDark ? "1px solid #1E293B" : "1px solid #E2E8F0",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          fontSize: "12px",
                        }}
                      />
                      <Legend verticalAlign="top" height={34} wrapperStyle={{ fontSize: 11 }} />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="valueUSD"
                        name="Kim ngạch (USD)"
                        fill="url(#usdGrad)"
                        stroke="#3B82F6"
                        strokeWidth={2.5}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="taxVND"
                        name="Thuế thu được (VND)"
                        stroke="#8B5CF6"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: "#8B5CF6", strokeWidth: 0 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tax Allocation Donut (4 Columns) */}
              <Card className="xl:col-span-4 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs flex flex-col justify-between page-break-avoid">
                <CardHeader className="pb-1 pt-4 px-5">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Award className="size-4 text-violet-600" />
                    Cơ cấu các khoản thu Thuế quan
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Tỷ trọng đóng góp theo từng sắc thuế
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 flex flex-col justify-between flex-1">
                  <div className="h-52 relative my-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taxPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={78}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {taxPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatVND(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Tổng số thu
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-white block tabular-nums">
                        {stats?.kpis?.totalTaxVND ? `${(stats.kpis.totalTaxVND / 1e12).toFixed(2)}T` : "0"}
                      </span>
                      <span className="text-[9px] text-slate-400 block">VND</span>
                    </div>
                  </div>

                  {/* Legend list with percentage indicators */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {taxPieData.slice(0, 5).map((item, idx) => {
                      const pct = stats?.kpis?.totalTaxVND
                        ? ((item.value / stats.kpis.totalTaxVND) * 100).toFixed(1)
                        : "0";
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                            <span
                              className="size-2.5 rounded-xs shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="truncate text-slate-600 dark:text-slate-300 font-medium">
                              {item.name}
                            </span>
                          </div>
                          <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* 3. Charts Section - Row 2: Commodities & Customs Channels */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              
              {/* Top Commodities (7 Columns) */}
              <Card className="xl:col-span-7 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs page-break-avoid">
                <CardHeader className="pb-1 pt-4 px-5">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Boxes className="size-4 text-emerald-600" />
                    Top nhóm hàng hóa có trị giá giao dịch lớn nhất
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Xếp hạng theo tổng trị giá quy đổi tiền đồng (VND)
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80 px-2 pb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(stats?.commodities || []).slice(0, 6)}
                      layout="vertical"
                      margin={{ top: 10, right: 25, left: 15, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke={isDark ? "#1E293B" : "#F1F5F9"}
                      />
                      <XAxis
                        type="number"
                        stroke="#94A3B8"
                        fontSize={9}
                        tickFormatter={(v) => `${(v / 1e12).toFixed(1)}T`}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#94A3B8"
                        fontSize={10}
                        width={130}
                        tickFormatter={(v) => (v.length > 22 ? `${v.substring(0, 22)}...` : v)}
                      />
                      <Tooltip formatter={(value: any) => [formatVND(value), "Trị giá"]} />
                      <Bar
                        dataKey="valueVND"
                        name="Trị giá (VND)"
                        fill="#10B981"
                        radius={[0, 5, 5, 0]}
                        barSize={16}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customs Clearance Channels (5 Columns) */}
              <Card className="xl:col-span-5 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs flex flex-col justify-between page-break-avoid">
                <CardHeader className="pb-1 pt-4 px-5">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <AlertTriangle className="size-4 text-amber-500" />
                    Tỷ lệ Phân luồng Tờ khai & Mức độ Tuân thủ
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Quản lý rủi ro thông quan tự động VNACCS/VCIS
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5 flex-1 flex flex-col justify-around">
                  <div className="space-y-4 pt-2">
                    {channelData.map((item: any, idx: number) => {
                      const total = stats?.kpis?.totalDeclarations || 1;
                      const pct = ((item.value / total) * 100).toFixed(1);
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className="size-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {item.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
                              <span className="text-slate-500">{formatNumber(item.value)} TK</span>
                              <span className="font-bold text-slate-900 dark:text-white">({pct}%)</span>
                            </div>
                          </div>
                          {/* Progress Bar */}
                          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed mt-4">
                    <strong>Ghi chú nghiệp vụ:</strong> Tỷ lệ luồng xanh đạt trên 60% giúp rút ngắn thời gian giải phóng hàng xuống dưới 15 phút đối với hàng hóa tiêu chuẩn.
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* 4. AI Executive Briefing Hub */}
            <Card className="border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/30 via-white to-violet-50/20 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-950 shadow-md page-break-avoid">
              <CardHeader className="pb-2 pt-4 px-5 border-b border-indigo-100/80 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-extrabold text-indigo-900 dark:text-indigo-300">
                        Bản tin Nhận định Trí tuệ Nhân tạo (AI Customs Briefing)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Phân tích rủi ro, cơ cấu nguồn thu và dự báo kinh tế vĩ mô dựa trên mô hình Gemini
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {aiLoading && (
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <RefreshCw className="size-3.5 animate-spin" />
                        Đang phân tích...
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={handleCopyInsight}
                      disabled={!aiInsight}
                      className="gap-1 text-xs border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                    >
                      {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                      {copied ? "Đã sao chép" : "Sao chép báo cáo"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 px-6 max-h-[480px] overflow-y-auto print:max-h-none print:overflow-visible">
                {aiInsight ? (
                  <div className="space-y-1">{renderMarkdown(aiInsight)}</div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Sparkles className="size-8 text-indigo-400 animate-bounce" />
                    <p className="text-xs text-slate-400 font-medium">
                      Bấm nút &quot;Phân tích AI&quot; ở thanh công cụ để tạo nhận định tự động.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 5. Interactive Enterprise Rankings Table */}
            <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs page-break-avoid">
              <CardHeader className="pb-3 pt-4 px-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                      <Globe2 className="size-4 text-blue-600" />
                      Bảng xếp hạng Top Doanh nghiệp Hoạt động Năng động nhất
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Thống kê theo tổng kim ngạch quy đổi USD và số lượng container
                    </CardDescription>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full md:w-64">
                    <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên hoặc MST..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <th className="py-3 px-4 w-12 text-center">Hạng</th>
                        <th className="py-3 px-4">Mã số thuế</th>
                        <th className="py-3 px-4">Tên Doanh nghiệp</th>
                        <th className="py-3 px-4 text-right">Kim ngạch (USD)</th>
                        <th className="py-3 px-4 text-center">Số Tờ khai</th>
                        <th className="py-3 px-4 text-center">Container</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredEnterprises.map((ent: any, idx: number) => {
                        const rank = idx + 1;
                        return (
                          <tr
                            key={idx}
                            className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors font-medium"
                          >
                            <td className="py-3 px-4 text-center font-bold">
                              {rank === 1 ? (
                                <span className="inline-flex size-6 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 items-center justify-center text-xs">
                                  🥇
                                </span>
                              ) : rank === 2 ? (
                                <span className="inline-flex size-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 items-center justify-center text-xs">
                                  🥈
                                </span>
                              ) : rank === 3 ? (
                                <span className="inline-flex size-6 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-500 items-center justify-center text-xs">
                                  🥉
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono text-xs">{rank}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                              {ent.taxId}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                              {ent.name}
                            </td>
                            <td className="py-3 px-4 text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                              {formatUSD(ent.valueUSD)}
                            </td>
                            <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600 dark:text-slate-400">
                              {formatNumber(ent.declarations)}
                            </td>
                            <td className="py-3 px-4 text-center font-bold tabular-nums text-slate-800 dark:text-slate-200">
                              {formatNumber(ent.containers)}
                            </td>
                          </tr>
                        );
                      })}
                      {filteredEnterprises.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                            Không tìm thấy doanh nghiệp nào phù hợp với từ khóa &quot;{searchQuery}&quot;.
                          </td>
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

      {/* Global CSS for Print and Vector PDF formatting */}
      <style jsx global>{`
        .pdf-report-header {
          display: none;
        }
        @media print {
          body {
            background: white !important;
            color: #0f172a !important;
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
