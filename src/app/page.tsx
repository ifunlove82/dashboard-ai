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
  BrainCircuit,
  ArrowUpDown,
  Info,
  X,
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

// Helper for custom markdown rendering in Executive Briefing
function renderMarkdown(text: string) {
  if (!text) return null;
  return text.split("\n").map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={idx}
          className="text-sm md:text-base font-bold mt-4 mb-2 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-2"
        >
          <BarChart3 className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
          {trimmed.replace("### ", "")}
        </h3>
      );
    }
    if (trimmed.startsWith("#### ")) {
      return (
        <h4
          key={idx}
          className="text-xs md:text-sm font-semibold mt-3 mb-1 text-slate-800 dark:text-slate-200"
        >
          {trimmed.replace("#### ", "")}
        </h4>
      );
    }
    if (trimmed.startsWith("- ")) {
      return (
        <li key={idx} className="ml-5 list-disc mb-1 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
          {renderInline(trimmed.replace("- ", ""))}
        </li>
      );
    }
    if (trimmed.startsWith("* ")) {
      return (
        <li key={idx} className="ml-5 list-disc mb-1 italic text-slate-600 dark:text-slate-400 text-xs">
          {trimmed.replace("* ", "")}
        </li>
      );
    }
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      return (
        <p key={idx} className="font-bold my-1 text-slate-800 dark:text-slate-200 text-xs">
          {trimmed.replace(/\*\*/g, "")}
        </p>
      );
    }
    if (trimmed === "---") {
      return <hr key={idx} className="my-2.5 border-slate-200 dark:border-slate-800" />;
    }
    if (trimmed) {
      return (
        <p key={idx} className="my-1.5 text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
          {renderInline(trimmed)}
        </p>
      );
    }
    return <div key={idx} className="h-1" />;
  });
}

// Resilient currency & number formatters (handles null, undefined, NaN, Infinity)
const formatUSD = (val?: number | null) => {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return "$0";
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  return `$${Math.round(val).toLocaleString("en-US")}`;
};

const formatVND = (val?: number | null) => {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return "0 VND";
  if (val >= 1e12) return `${(val / 1e12).toFixed(2)}T VND`;
  if (val >= 1e9) return `${(val / 1e9).toFixed(1)} Tỷ VND`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(0)} Tr VND`;
  return `${Math.round(val).toLocaleString("vi-VN")} VND`;
};

const formatNumber = (val?: number | null) => {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return "0";
  return Math.round(val).toLocaleString("vi-VN");
};

export default function CustomsDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loaiXNK, setLoaiXNK] = useState("ALL");
  const [datePreset, setDatePreset] = useState("first-half-2026");
  const [dbStatus, setDbStatus] = useState<"live" | "fallback">("fallback");
  const [activeSection, setActiveSection] = useState("overview");

  // AI State
  const [aiInsight, setAiInsight] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Search & Table Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"valueUSD" | "declarations" | "containers">("valueUSD");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Theme state
  const [isDark, setIsDark] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);
  const statsAbortRef = useRef<AbortController | null>(null);
  const aiAbortRef = useRef<AbortController | null>(null);

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      statsAbortRef.current?.abort();
      aiAbortRef.current?.abort();
    };
  }, []);

  // Smooth scroll handler for navigation
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Scroll-spy: Track active section on natural viewport scroll
  useEffect(() => {
    const sectionIds = ["overview", "trends-tax", "commodities-channels", "ai-briefing", "enterprises"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-15% 0px -60% 0px", threshold: 0.1 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Keyboard shortcuts: '/' focuses search, 'Escape' clears
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Theme initialize
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
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  // Preset Date Ranges
  const getDateRange = (preset: string) => {
    switch (preset) {
      case "first-half-2026":
        return { start: "2026-01-01", end: "2026-06-30" };
      case "q1-2026":
        return { start: "2026-01-01", end: "2026-03-31" };
      case "q2-2026":
        return { start: "2026-04-01", end: "2026-06-30" };
      default:
        return { start: "2026-01-01", end: "2026-06-30" };
    }
  };

  const { start: startDate, end: endDate } = getDateRange(datePreset);

  // Run AI analysis - Abortable, race-condition protected
  const runAiAnalysis = useCallback(async (currentStats?: any) => {
    const target = currentStats || stats;
    if (!target) return;

    aiAbortRef.current?.abort();
    const controller = new AbortController();
    aiAbortRef.current = controller;

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(target),
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`Phản hồi lỗi ${res.status}`);
      }
      const data = await res.json();
      setAiInsight(data.insight || "");
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("AI Analysis failed:", error);
      setAiInsight(
        "### Không thể hoàn tất phân tích nhận định AI\n" +
        `- **Thông tin lỗi:** ${error.message || "Gián đoạn mạng hoặc dịch vụ bận."}\n` +
        "- **Xử lý:** Vui lòng kiểm tra file cấu hình `.env.local` hoặc nhấp nút **'Phân tích AI'** trên thanh công cụ để thử lại."
      );
    } finally {
      setAiLoading(false);
    }
  }, [stats]);

  // Data fetching - Abortable, race-condition protected, error surfaced
  const fetchStats = useCallback(async () => {
    statsAbortRef.current?.abort();
    const controller = new AbortController();
    statsAbortRef.current = controller;

    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(
        `/api/stats?startDate=${startDate}&endDate=${endDate}&loaiXNK=${loaiXNK}`,
        { signal: controller.signal }
      );
      if (!res.ok) {
        throw new Error(`Máy chủ báo lỗi ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setStats(data);
      setDbStatus(data.isMock ? "fallback" : "live");
      runAiAnalysis(data);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch dashboard data:", error);
      setFetchError(error.message || "Lỗi đường truyền kết nối");
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

  // Tax Breakdown Data: Unambiguous domain taxonomy
  const taxPieData = useMemo(() => {
    if (!stats || !stats.taxBreakdown) return [];
    const tb = stats.taxBreakdown;
    return [
      { name: "Thuế Giá trị gia tăng (VAT)", value: tb.thueV, color: "#0284C7" },
      { name: "Thuế Xuất Nhập Khẩu", value: tb.thueXNK, color: "#2563EB" },
      { name: "Thuế Tiêu thụ đặc biệt (TTĐB)", value: tb.thueT, color: "#D97706" },
      { name: "Thuế Bảo vệ môi trường (BVMT)", value: tb.thueM, color: "#7C3AED" },
      { name: "Thuế Tự vệ & Chống bán phá giá", value: tb.thueCBPG, color: "#E11D48" },
      { name: "Các khoản sắc thuế khác", value: tb.thueKhac, color: "#64748B" },
    ];
  }, [stats]);

  // Channels with exclusive semantic colors
  const channelData = useMemo(() => {
    if (!stats || !stats.channels) return [];
    return stats.channels.map((ch: any) => {
      let color = "#10B981"; // Luồng Xanh
      if (ch.name.includes("Vàng")) color = "#F59E0B"; // Luồng Vàng
      if (ch.name.includes("Đỏ")) color = "#EF4444"; // Luồng Đỏ
      return { ...ch, color };
    });
  }, [stats]);

  // Sorting handler for enterprise table
  const handleSort = (field: "valueUSD" | "declarations" | "containers") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filtered & Sorted Enterprises
  const filteredEnterprises = useMemo(() => {
    const listSource = stats?.enterprises || stats?.topEnterprises || [];
    if (!listSource || listSource.length === 0) return [];
    let list = listSource.filter((ent: any) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (ent.name && ent.name.toLowerCase().includes(q)) ||
        (ent.taxId && ent.taxId.includes(q))
      );
    });

    list = [...list].sort((a: any, b: any) => {
      const factor = sortOrder === "desc" ? -1 : 1;
      const valA = Number(a[sortField]) || 0;
      const valB = Number(b[sortField]) || 0;
      return (valA - valB) * factor;
    });

    return list;
  }, [stats, searchQuery, sortField, sortOrder]);

  const navItems = [
    { id: "overview", label: "Tổng quan chỉ số", icon: TrendingUp },
    { id: "trends-tax", label: "Xu hướng & Thuế thu", icon: Award },
    { id: "commodities-channels", label: "Hàng hóa & Phân luồng", icon: Boxes },
    { id: "ai-briefing", label: "Bản tin Nhận định AI", icon: BrainCircuit },
    { id: "enterprises", label: "Doanh nghiệp XNK", icon: Briefcase },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100/70 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased">
      
      {/* Top subtle indeterminate progress bar during fetch */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-blue-100 dark:bg-blue-950/80 overflow-hidden z-50">
          <div className="h-full bg-blue-600 dark:bg-blue-400 w-1/3 animate-[indeterminate_1.5s_infinite_linear]" />
        </div>
      )}

      {/* Sidebar Navigation - Fixed & Smooth Scrollable */}
      <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 p-5 flex flex-col justify-between shrink-0 hidden lg:flex print:hidden shadow-xs sticky top-0 h-screen">
        <div className="space-y-6">
          {/* Logo & Operational Title */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                VNACCS Intel
              </h1>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block leading-tight">
                Tổng cục Hải quan Việt Nam
              </span>
            </div>
          </div>

          {/* Navigation Items with Active Tracking */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 block mb-2">
              Phân hệ Phân tích
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full justify-start gap-2.5 font-medium text-xs transition-all ${
                    isActive
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Database Connection Status Card */}
          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 block mb-2">
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
                  {dbStatus === "live" ? "SQL Server Thực" : "CSDL Mô phỏng"}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {dbStatus === "live"
                  ? "Truy vấn trực tiếp CSDL VNACCS_REPORT (bảng rpToKhai & rpHang)."
                  : "Chưa kết nối SQL Server. Đang hiển thị dữ liệu mẫu nghiệp vụ Hải quan VN."}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Footer - Professional Government Systems */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">Hệ thống VNACCS/VCIS</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
            Cục CNTT & Thống kê
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-[1600px] mx-auto w-full print:p-0 print:max-w-none">
        
        {/* Top Header & Filter Controls (Hidden in print) */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800 print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                HỆ THỐNG ĐIỀU HÀNH & THỐNG KÊ HẢI QUAN
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Bộ Tài chính • Tổng cục Hải quan
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Báo cáo Thống kê Hoạt động Hải quan & Kim ngạch XNK
            </h2>
          </div>

          {/* Action & Filter Toolbar - Grouped cleanly */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Group: Date + Regime */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {/* Date Preset Selector */}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg shadow-2xs">
                <Calendar className="size-3.5 text-slate-500 shrink-0" />
                <select
                  aria-label="Chọn khoảng thời gian thống kê"
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
              <div className="flex items-center gap-1">
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
                  Toàn bộ
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
            </div>

            {/* Action Group: AI + Print + Theme */}
            <div className="flex items-center gap-1.5">
              {/* AI Re-Analyze Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => runAiAnalysis()}
                disabled={aiLoading}
                className="gap-1.5 text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs"
              >
                <BrainCircuit className={`size-3.5 ${aiLoading ? "animate-spin text-blue-600" : "text-blue-600 dark:text-blue-400"}`} />
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
        </div>

        {/* Mobile Quick-Navigation Pills (visible on < lg) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 lg:hidden print:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800"
                }`}
              >
                <Icon className="size-3" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Smooth wrapper preserving view during background fetch */}
        <div
          ref={reportRef}
          id="report-container"
          className={`space-y-6 transition-opacity duration-200 ${
            loading && !stats ? "opacity-30" : "opacity-100"
          }`}
        >
          {/* Header visible in PDF / Print Mode */}
          <div className="pdf-report-header pb-4 border-b border-slate-300">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                  BÁO CÁO THỐNG KÊ HOẠT ĐỘNG HẢI QUAN & THƯƠNG MẠI XNK
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Kỳ thống kê: {datePreset === "first-half-2026" ? "6 tháng đầu năm 2026" : datePreset === "q1-2026" ? "Quý 1/2026" : "Quý 2/2026"} | 
                  Loại hình: {loaiXNK === "ALL" ? "Toàn bộ Xuất Nhập Khẩu" : loaiXNK === "NK" ? "Nhập khẩu (NK)" : "Xuất khẩu (XK)"}
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm text-blue-900">VNACCS/VCIS INTEL</div>
                <div className="text-[10px] text-slate-500">Thời điểm in: {new Date().toLocaleDateString("vi-VN")}</div>
              </div>
            </div>
          </div>

          {/* Connection Error Banner with Retry */}
          {fetchError && !stats && (
            <div className="p-5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs" role="alert">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold">Không thể kết nối máy chủ thống kê Hải quan</h3>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                    {fetchError}. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => fetchStats()}
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white shrink-0 self-start sm:self-center gap-1.5 text-xs font-semibold shadow-2xs"
              >
                <RefreshCw className="size-3.5" />
                Thử lại kết nối
              </Button>
            </div>
          )}

          {/* 1. Refined KPI Cards Grid */}
          <div id="overview" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4 scroll-mt-6">
            
            {/* Total Declarations */}
            <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-colors flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tổng số tờ khai
                </span>
                <div className="size-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <FileText className="size-3.5" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3.5 pt-0 flex flex-col justify-between flex-1">
                <div className="text-xl sm:text-2xl font-black tracking-tight tabular-nums text-slate-900 dark:text-white">
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
                      : "0%"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Total USD Value */}
            <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs hover:border-sky-400 dark:hover:border-sky-600 transition-colors flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Kim ngạch XNK
                </span>
                <div className="size-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
                  <DollarSign className="size-3.5" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3.5 pt-0 flex flex-col justify-between flex-1">
                <div className="text-xl sm:text-2xl font-black tracking-tight tabular-nums text-slate-900 dark:text-white">
                  {formatUSD(stats?.kpis?.totalValueUSD || 0)}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Ước tính quy đổi:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300" title="Quy đổi theo tỷ giá hạch toán tạm tính 25.000 VND/USD">
                    {stats?.kpis?.totalValueUSD
                      ? `${((stats.kpis.totalValueUSD * 25000) / 1e12).toFixed(1)} Tỷ VND`
                      : "0 Tỷ VND"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Total Tax Revenue - Disciplined Slate/Indigo */}
            <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Thuế Hải quan đã thu
                </span>
                <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <Award className="size-3.5" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3.5 pt-0 flex flex-col justify-between flex-1">
                <div className="text-xl sm:text-2xl font-black tracking-tight tabular-nums text-slate-900 dark:text-white">
                  {formatVND(stats?.kpis?.totalTaxVND || 0)}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Tỷ lệ động viên ngân sách:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {stats?.kpis?.totalTaxVND && stats?.kpis?.totalValueUSD
                      ? `${((stats.kpis.totalTaxVND / (stats.kpis.totalValueUSD * 25000)) * 100).toFixed(2)}%`
                      : "0.00%"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Volume & Weight */}
            <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-colors flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Vận chuyển & Container
                </span>
                <div className="size-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <Truck className="size-3.5" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3.5 pt-0 flex flex-col justify-between flex-1">
                <div className="text-xl sm:text-2xl font-black tracking-tight tabular-nums text-slate-900 dark:text-white">
                  {formatNumber(stats?.kpis?.totalContainers || 0)}{" "}
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">TEU</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Khối lượng tịnh:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {formatNumber(Math.round(stats?.kpis?.totalWeightTNE || 0))} Tấn (TNE)
                  </span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* 2. Charts Section - Row 1: Trend & Tax Distribution */}
          <div id="trends-tax" className="grid grid-cols-1 xl:grid-cols-12 gap-5 scroll-mt-6">
            
            {/* Trend Chart (8 Columns) */}
            <Card className="xl:col-span-8 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs page-break-avoid min-w-0">
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
              <CardContent className="h-72 sm:h-80 px-2 pb-3">
                {stats?.trends && stats.trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <ComposedChart data={stats.trends}>
                      <defs>
                        <linearGradient id="usdGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
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
                        stroke="#2563EB"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#4F46E5"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1e9).toFixed(0)} Tỷ`}
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
                        stroke="#2563EB"
                        strokeWidth={2.5}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="taxVND"
                        name="Thuế thu được (VND)"
                        stroke="#4F46E5"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: "#4F46E5", strokeWidth: 0 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
                    <TrendingUp className="size-8 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
                    Chưa có số liệu chuỗi thời gian cho bộ lọc đã chọn
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tax Allocation Donut (4 Columns) */}
            <Card className="xl:col-span-4 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs flex flex-col justify-between page-break-avoid min-w-0">
              <CardHeader className="pb-1 pt-4 px-5">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Award className="size-4 text-blue-600" />
                  Cơ cấu các khoản thu Thuế quan
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Tỷ trọng đóng góp theo từng sắc thuế
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 flex flex-col justify-between flex-1">
                <div className="h-52 relative my-1">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Tổng số thu
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white block tabular-nums">
                      {stats?.kpis?.totalTaxVND ? `${(stats.kpis.totalTaxVND / 1e12).toFixed(2)}T` : "0"}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block">VND</span>
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
          <div id="commodities-channels" className="grid grid-cols-1 xl:grid-cols-12 gap-5 scroll-mt-6">
            
            {/* Top Commodities (7 Columns) - Sky Blue palette avoiding Green clash */}
            <Card className="xl:col-span-7 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs page-break-avoid min-w-0">
              <CardHeader className="pb-1 pt-4 px-5">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Boxes className="size-4 text-sky-600" />
                  Top nhóm hàng hóa có trị giá giao dịch lớn nhất
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Xếp hạng theo tổng trị giá quy đổi tiền đồng (VND)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72 sm:h-80 px-2 pb-3">
                {stats?.commodities && stats.commodities.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart
                      data={stats.commodities.slice(0, 6)}
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
                        fill="#0284C7"
                        radius={[0, 5, 5, 0]}
                        barSize={16}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
                    <Boxes className="size-8 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
                    Chưa có dữ liệu hàng hóa trọng điểm cho kỳ báo cáo này
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customs Clearance Channels (5 Columns) - Green/Yellow/Red strictly preserved */}
            <Card className="xl:col-span-5 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs flex flex-col justify-between page-break-avoid min-w-0">
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

                <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed mt-4 flex items-start gap-2">
                  <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Căn cứ Điều 32 Luật Hải quan số 54/2014/QH13:</strong>
                    <div className="mt-0.5 text-slate-600 dark:text-slate-300 space-y-0.5">
                      <div>• <strong>Luồng Xanh:</strong> Miễn kiểm tra hồ sơ và hàng hóa, thông quan tự động tức thời.</div>
                      <div>• <strong>Luồng Vàng:</strong> Kiểm tra chi tiết bộ chứng từ hải quan trước khi thông quan.</div>
                      <div>• <strong>Luồng Đỏ:</strong> Kiểm tra chi tiết chứng từ kết hợp kiểm tra thực tế hàng hóa tại cảng/cửa khẩu.</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* 4. AI Executive Intelligence Briefing (Instant authoritative presentation) */}
          <Card
            id="ai-briefing"
            role="region"
            aria-label="Bản tin nhận định điều hành hải quan"
            aria-live="polite"
            className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-sm page-break-avoid scroll-mt-6"
          >
            <CardHeader className="pb-3 pt-4 px-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <BrainCircuit className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      Phiếu Thông báo Nhận định Điều hành Hải quan
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Đánh giá rủi ro tờ khai, dự báo tiến độ thu ngân sách và chỉ số vĩ mô từ mô hình Gemini
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {aiLoading && (
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <RefreshCw className="size-3.5 animate-spin" />
                      Đang tổng hợp nhận định...
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={handleCopyInsight}
                    disabled={!aiInsight}
                    className="gap-1 text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
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
                <div className="flex flex-col items-center justify-center py-10 space-y-2.5">
                  <BrainCircuit className="size-7 text-slate-400" />
                  <p className="text-xs text-slate-500 font-medium text-center max-w-md">
                    Chưa có bản tin nhận định cho kỳ thống kê này. Bấm nút &quot;Phân tích AI&quot; ở thanh công cụ để mô hình Gemini tổng hợp đánh giá rủi ro và dự báo thu ngân sách.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5. Interactive Enterprise Rankings Table with Column Sorting */}
          <Card id="enterprises" className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs page-break-avoid scroll-mt-6">
            <CardHeader className="pb-3 pt-4 px-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Globe2 className="size-4 text-blue-600" />
                    Bảng xếp hạng Top Doanh nghiệp Hoạt động Năng động nhất
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 flex flex-wrap items-center justify-between gap-1">
                    <span>Thống kê theo tổng kim ngạch quy đổi USD và số lượng container (Bấm tiêu đề để sắp xếp)</span>
                    <span className="inline-flex sm:hidden text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                      Vuốt ngang xem đủ cột →
                    </span>
                  </CardDescription>
                </div>

                {/* Search Input with Keyboard Shortcut '/' & Clear Button */}
                <div className="relative w-full md:w-72">
                  <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    maxLength={100}
                    aria-label="Tìm kiếm doanh nghiệp theo tên hoặc mã số thuế"
                    placeholder="Tìm theo tên hoặc MST... (phím /)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-8 pr-12 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 touch-manipulation"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      aria-label="Xóa nội dung tìm kiếm"
                      className="absolute right-7 md:right-8 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                  <kbd className="hidden md:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono bg-slate-200/70 dark:bg-slate-800 text-slate-500 rounded border border-slate-300/80 dark:border-slate-700 pointer-events-none">
                    /
                  </kbd>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto overscroll-x-contain touch-pan-x">
                <table className="w-full text-left text-xs border-collapse min-w-[640px]">
                  <thead>
                    <tr className="bg-slate-50/90 dark:bg-slate-800/60 sticky top-0 z-10 backdrop-blur-xs text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                      <th className="py-3 px-4 w-14 text-center">Thứ hạng</th>
                      <th className="py-3 px-4">Mã số thuế</th>
                      <th className="py-3 px-4">Tên Doanh nghiệp</th>
                      <th
                        onClick={() => handleSort("valueUSD")}
                        aria-label="Sắp xếp theo Kim ngạch USD"
                        className="py-3 px-4 text-right cursor-pointer hover:text-blue-600 transition-colors select-none"
                      >
                        <div className="flex items-center justify-end gap-1">
                          Kim ngạch (USD)
                          <ArrowUpDown className="size-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("declarations")}
                        aria-label="Sắp xếp theo Số tờ khai"
                        className="py-3 px-4 text-center cursor-pointer hover:text-blue-600 transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1">
                          Số Tờ khai
                          <ArrowUpDown className="size-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("containers")}
                        aria-label="Sắp xếp theo Container TEU"
                        className="py-3 px-4 text-center cursor-pointer hover:text-blue-600 transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1">
                          Container (TEU)
                          <ArrowUpDown className="size-3" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredEnterprises.map((ent: any, idx: number) => {
                      const rank = idx + 1;
                      return (
                        <tr
                          key={idx}
                          className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors font-medium"
                        >
                          <td className="py-3 px-4 text-center font-bold">
                            {rank === 1 ? (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                #1
                              </span>
                            ) : rank === 2 ? (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-black bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-400/30">
                                #2
                              </span>
                            ) : rank === 3 ? (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-black bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30">
                                #3
                              </span>
                            ) : (
                              <span className="text-slate-500 dark:text-slate-400 font-mono text-xs font-semibold">#{rank}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                            {ent.taxId}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 max-w-[240px] sm:max-w-[320px]">
                            <div className="truncate" title={ent.name}>
                              {ent.name}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-bold tabular-nums text-slate-900 dark:text-slate-100">
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
                        <td colSpan={6} className="py-10 text-center space-y-2">
                          <p className="text-slate-600 dark:text-slate-300 font-medium text-xs">
                            Không tìm thấy doanh nghiệp nào khớp với từ khóa &quot;<span className="font-bold text-slate-900 dark:text-white">{searchQuery}</span>&quot;.
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Vui lòng kiểm tra lại Mã số thuế hoặc Tên công ty, hoặc nhấn <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">Esc</kbd> để xóa tìm kiếm.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      {/* Global CSS for Print and Vector PDF formatting */}
      <style jsx global>{`
        .pdf-report-header {
          display: none;
        }
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
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
