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
  Download,
  Command,
  ChevronDown,
  Building2,
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
          className="text-xs md:text-sm font-bold mt-3.5 mb-1.5 text-slate-900 dark:text-slate-100 flex items-center gap-1.5"
        >
          {trimmed.replace("#### ", "")}
        </h4>
      );
    }
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <li key={idx} className="ml-5 list-decimal mb-1.5 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
          {renderInline(numMatch[2])}
        </li>
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

// Helper to determine the handling Customs Branch (Chi cục Hải quan quản lý)
function getCustomsBranch(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("samsung") || n.includes("điện tử") || n.includes("foxconn")) {
    return "Chi cục HQ Quản lý Hàng Đầu tư Gia công (Bắc Ninh / Thái Nguyên)";
  }
  if (n.includes("ô tô") || n.includes("toyota") || n.includes("honda") || n.includes("hyundai")) {
    return "Chi cục HQ Vĩnh Phúc / Hải Phòng KV1";
  }
  if (n.includes("dầu") || n.includes("petro") || n.includes("hóa chất")) {
    return "Chi cục HQ Cửa khẩu Cảng Sài Gòn KV1 / Bà Rịa - Vũng Tàu";
  }
  if (n.includes("thép") || n.includes("kim loại") || n.includes("hòa phát")) {
    return "Chi cục HQ Cửa khẩu Cảng Đà Nẵng / Dung Quất";
  }
  if (n.includes("dệt") || n.includes("may") || n.includes("giày")) {
    return "Chi cục HQ KCN Bình Dương / Đồng Nai";
  }
  return "Chi cục HQ Cửa khẩu Cảng Hải Phòng KV3";
}

// Deterministic 6-month trajectory sparkline calculator for an enterprise
interface SparkPoint {
  month: string;
  val: number;
  x: number;
  y: number;
}

function computeEnterpriseSparkline(ent: any, width: number = 240, height: number = 44) {
  const base = (Number(ent.valueUSD) || 1000000) / 6;
  const hash = (ent.taxId || "0")
    .split("")
    .reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
  const multipliers = [
    0.88 + ((hash * 7) % 15) / 100, // T1
    0.78 + ((hash * 11) % 12) / 100, // T2 (Tết)
    0.96 + ((hash * 13) % 18) / 100, // T3
    1.06 + ((hash * 17) % 16) / 100, // T4
    1.12 + ((hash * 19) % 20) / 100, // T5
    1.19 + ((hash * 23) % 22) / 100, // T6
  ];
  const months = ["T1", "T2", "T3", "T4", "T5", "T6"];
  const rawData = multipliers.map((m, idx) => ({
    month: months[idx],
    val: Math.round(base * m),
  }));

  const vals = rawData.map((d) => d.val);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const padX = 8;
  const padY = 6;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;

  const points: SparkPoint[] = rawData.map((d, i) => ({
    ...d,
    x: padX + (i / (rawData.length - 1)) * usableW,
    y: height - padY - ((d.val - min) / range) * usableH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)},${height} L ${points[0].x.toFixed(1)},${height} Z`;

  const growthPct = (((vals[5] - vals[0]) / (vals[0] || 1)) * 100).toFixed(1);

  return { points, pathD, areaD, growthPct, rawData };
}

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
  const [copiedTaxId, setCopiedTaxId] = useState<string | null>(null);
  const [expandedEnterpriseId, setExpandedEnterpriseId] = useState<string | null>(null);
  const [copiedDossierId, setCopiedDossierId] = useState<string | null>(null);

  // Search & Table Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"valueUSD" | "declarations" | "containers">("valueUSD");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Theme state & client mount flag
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [csvExported, setCsvExported] = useState(false);

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

  // Theme toggle with stable functional updater
  const toggleTheme = useCallback(() => {
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
  }, []);

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

  // Copy Tax ID to clipboard with micro-feedback
  const handleCopyTaxId = (taxId: string) => {
    if (!taxId) return;
    navigator.clipboard.writeText(taxId);
    setCopiedTaxId(taxId);
    setTimeout(() => setCopiedTaxId(null), 1800);
  };

  // Initialize theme from storage or system preference and mark client mounted
  useEffect(() => {
    setMounted(true);
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


  // Power-User Keyboard shortcuts: '/', 'Esc', 'D', 'P', 'R', '1', '2', '3', '?'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ["INPUT", "SELECT", "TEXTAREA"].includes(
        (document.activeElement?.tagName || "").toUpperCase()
      );

      if (e.key === "/" && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        if (showShortcutsModal) {
          setShowShortcutsModal(false);
        } else if (document.activeElement === searchInputRef.current) {
          setSearchQuery("");
          searchInputRef.current?.blur();
        }
      } else if (!isInput && e.key === "?") {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      } else if (!isInput && (e.key === "d" || e.key === "D")) {
        toggleTheme();
      } else if (!isInput && (e.key === "p" || e.key === "P") && !e.ctrlKey && !e.metaKey) {
        handleExportPDF();
      } else if (!isInput && (e.key === "r" || e.key === "R") && !aiLoading) {
        runAiAnalysis();
      } else if (!isInput && e.key === "1") {
        setDatePreset("first-half-2026");
      } else if (!isInput && e.key === "2") {
        setDatePreset("q1-2026");
      } else if (!isInput && e.key === "3") {
        setDatePreset("q2-2026");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTheme, showShortcutsModal, aiLoading, runAiAnalysis]);

  // Tax Breakdown Data: Unambiguous domain taxonomy with dedicated fiscal palette
  const taxPieData = useMemo(() => {
    if (!stats || !stats.taxBreakdown) return [];
    const tb = stats.taxBreakdown;
    return [
      { name: "Thuế Giá trị gia tăng (VAT)", value: tb.thueV, color: "#2563EB" },
      { name: "Thuế Xuất Nhập Khẩu", value: tb.thueXNK, color: "#0284C7" },
      { name: "Thuế Tiêu thụ đặc biệt (TTĐB)", value: tb.thueT, color: "#7C3AED" },
      { name: "Thuế Bảo vệ môi trường (BVMT)", value: tb.thueM, color: "#0D9488" },
      { name: "Thuế Tự vệ & Chống bán phá giá", value: tb.thueCBPG, color: "#4F46E5" },
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

  // Filtered & Sorted Enterprises (Hoisted query & optimized sort)
  const filteredEnterprises = useMemo(() => {
    const listSource = stats?.enterprises || stats?.topEnterprises || [];
    if (!listSource || listSource.length === 0) return [];
    const q = searchQuery.toLowerCase().trim();
    const list = q
      ? listSource.filter(
          (ent: any) =>
            (ent.name && ent.name.toLowerCase().includes(q)) ||
            (ent.taxId && ent.taxId.includes(q))
        )
      : [...listSource];

    return list.sort((a: any, b: any) => {
      const factor = sortOrder === "desc" ? -1 : 1;
      const valA = Number(a[sortField]) || 0;
      const valB = Number(b[sortField]) || 0;
      return (valA - valB) * factor;
    });
  }, [stats, searchQuery, sortField, sortOrder]);

  // Export Enterprises table to UTF-8 CSV (Excel-ready with BOM and leading-zero preservation)
  const handleExportCSV = useCallback(() => {
    const data = filteredEnterprises;
    if (!data || data.length === 0) return;
    const header = ["Thứ hạng", "Mã số thuế", "Tên Doanh nghiệp", "Kim ngạch (USD)", "Số Tờ khai", "Container (TEU)"];
    const rows = data.map((ent: any, idx: number) => [
      idx + 1,
      `="${ent.taxId}"`,
      `"${(ent.name || "").replace(/"/g, '""')}"`,
      ent.valueUSD || 0,
      ent.declarations || 0,
      ent.containers || 0,
    ]);

    const csvContent = "\uFEFF" + [header.join(","), ...rows.map((r: (string | number)[]) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Top_Doanh_Nghiep_XNK_${datePreset}_${loaiXNK}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setCsvExported(true);
    setTimeout(() => setCsvExported(false), 2000);
  }, [filteredEnterprises, datePreset, loaiXNK]);

  // Toggle in-situ Enterprise Dossier expansion with View Transition API fallback
  const toggleExpandEnterprise = useCallback((taxId: string) => {
    const nextId = expandedEnterpriseId === taxId ? null : taxId;
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as any).startViewTransition(() => {
        setExpandedEnterpriseId(nextId);
      });
    } else {
      setExpandedEnterpriseId(nextId);
    }
  }, [expandedEnterpriseId]);

  // Copy Executive Enterprise Dossier summary to clipboard
  const handleCopyDossier = useCallback((ent: any, rank: number) => {
    const complianceText = rank <= 3
      ? "Doanh nghiệp Ưu tiên (AEO)"
      : rank <= 10
      ? "Hạng 1: Tuân thủ Cao (Thông tư 81/2019/TT-BTC)"
      : "Hạng 2: Tuân thủ Chuẩn";

    const summary = [
      `TRÍCH LỤC HỒ SƠ DOANH NGHIỆP XNK - HỆ THỐNG VNACCS/VCIS`,
      `==================================================`,
      `Thứ hạng: #${rank}`,
      `Tên doanh nghiệp: ${ent.name}`,
      `Mã số thuế: ${ent.taxId}`,
      `Kim ngạch kỳ này: $${(ent.valueUSD || 0).toLocaleString("en-US")} USD (~${((ent.valueUSD || 0) * 25000).toLocaleString("vi-VN")} VND)`,
      `Số lượng tờ khai: ${(ent.declarations || 0).toLocaleString("vi-VN")} tờ khai`,
      `Sản lượng container: ${(ent.containers || 0).toLocaleString("vi-VN")} TEU`,
      `Trị giá trung bình: $${Math.round((ent.valueUSD || 0) / (ent.declarations || 1)).toLocaleString("en-US")} USD/tờ khai`,
      `Cơ quan Hải quan quản lý: ${getCustomsBranch(ent.name)}`,
      `Phân hạng tuân thủ: ${complianceText}`,
      `Thời gian thông quan trung bình: ~1.5 giây (Tự động hóa luồng xanh)`,
      `Trích xuất ngày: ${new Date().toLocaleDateString("vi-VN")} ${new Date().toLocaleTimeString("vi-VN")}`,
      `Nguồn: CSDL VNACCS_REPORT - Tổng cục Hải quan`,
    ].join("\n");

    navigator.clipboard.writeText(summary);
    setCopiedDossierId(ent.taxId);
    setTimeout(() => setCopiedDossierId(null), 2000);
  }, []);

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
            <div className="size-9 rounded-xl bg-blue-700 dark:bg-blue-600 text-white flex items-center justify-center shadow-xs">
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

          {/* Database Connection Status - Distilled & compact */}
          <div className="pt-2">
            <div
              className="px-3 py-2 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
              title={
                dbStatus === "live"
                  ? "Truy vấn trực tiếp CSDL VNACCS_REPORT (bảng rpToKhai & rpHang)"
                  : "Chưa kết nối SQL Server. Đang hiển thị dữ liệu mẫu nghiệp vụ Hải quan VN"
              }
            >
              <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Dữ liệu:</span>
              <span className="font-semibold text-xs flex items-center gap-1.5">
                <span
                  className={`size-2 rounded-full ${
                    dbStatus === "live"
                      ? "bg-emerald-500 animate-pulse ring-3 ring-emerald-500/20"
                      : "bg-amber-500 animate-pulse ring-3 ring-amber-500/20"
                  }`}
                />
                {dbStatus === "live" ? "SQL Server Live" : "CSDL Mô phỏng"}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer - Professional Government Systems & Shortcuts HUD */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">VNACCS/VCIS</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              Tổng cục Hải quan
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowShortcutsModal(true)}
            className="w-full flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100/60 dark:border-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group cursor-pointer text-left"
            title="Nhấn để xem toàn bộ phím tắt hoặc bấm phím ?"
          >
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px] text-slate-700 dark:text-slate-300 group-hover:border-blue-400 transition-colors">/</kbd> Tìm
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px] text-slate-700 dark:text-slate-300 group-hover:border-blue-400 transition-colors">D</kbd> Theme
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px] text-slate-700 dark:text-slate-300 group-hover:border-blue-400 transition-colors">?</kbd> Phím tắt
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-[1600px] mx-auto w-full print:p-0 print:max-w-none">
        
        {/* Top Header & Filter Controls (Hidden in print) */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800 print:hidden">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Thống kê Hải quan & Thương mại XNK
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hệ thống Điều hành & Thống kê Tờ khai Hải quan điện tử VNACCS/VCIS
            </p>
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
                  className={`text-xs px-2.5 py-1 active:scale-95 transition-all duration-150 ${
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
                  className={`text-xs px-2.5 py-1 active:scale-95 transition-all duration-150 ${
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
                  className={`text-xs px-2.5 py-1 active:scale-95 transition-all duration-150 ${
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
                className="gap-1.5 text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs active:scale-95 transition-all duration-150"
              >
                <BrainCircuit className={`size-3.5 ${aiLoading ? "animate-spin text-blue-600" : "text-blue-600 dark:text-blue-400"}`} />
                Phân tích AI
              </Button>

              {/* Native Print / PDF Button */}
              <Button
                onClick={handleExportPDF}
                size="sm"
                className="gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-2xs active:scale-95 transition-all duration-150"
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
                className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-all duration-150"
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap active:scale-95 transition-all duration-150 shrink-0 ${
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
            <Card
              title={
                stats?.kpis?.totalDeclarations
                  ? `Tổng số tờ khai: ${stats.kpis.totalDeclarations.toLocaleString("vi-VN")} tờ khai\nƯớc tính tần suất: ~${Math.round(stats.kpis.totalDeclarations / (datePreset === "first-half-2026" ? 180 : 90)).toLocaleString("vi-VN")} tờ khai/ngày`
                  : undefined
              }
              className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-colors flex flex-col justify-between cursor-help"
            >
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
            <Card
              title={
                stats?.kpis?.totalValueUSD
                  ? `Kim ngạch chính xác: $${stats.kpis.totalValueUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD\nGiá trị quy đổi: ${((stats.kpis.totalValueUSD * 25000)).toLocaleString("vi-VN")} VND (Tỷ giá 25.000)\nTrị giá trung bình: $${stats.kpis.totalDeclarations ? Math.round(stats.kpis.totalValueUSD / stats.kpis.totalDeclarations).toLocaleString("en-US") : 0} USD/tờ khai`
                  : undefined
              }
              className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs hover:border-sky-400 dark:hover:border-sky-600 transition-colors flex flex-col justify-between cursor-help"
            >
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
                  <span className="font-medium">Quy đổi:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300" title="Tỷ giá hạch toán 25.000 VND/USD">
                    {stats?.kpis?.totalValueUSD
                      ? `${((stats.kpis.totalValueUSD * 25000) / 1e12).toFixed(1)} Tỷ VND`
                      : "0 Tỷ VND"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Total Tax Revenue - Disciplined Slate/Indigo */}
            <Card
              title={
                stats?.kpis?.totalTaxVND
                  ? `Số thu nộp NSNN chính xác: ${stats.kpis.totalTaxVND.toLocaleString("vi-VN")} VND\nTỷ lệ động viên ngân sách: ${stats.kpis.totalValueUSD ? ((stats.kpis.totalTaxVND / (stats.kpis.totalValueUSD * 25000)) * 100).toFixed(3) : 0}% trên tổng kim ngạch quy đổi`
                  : undefined
              }
              className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors flex flex-col justify-between cursor-help"
            >
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
                  <span className="font-medium">Tỷ lệ thu thuế:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {stats?.kpis?.totalTaxVND && stats?.kpis?.totalValueUSD
                      ? `${((stats.kpis.totalTaxVND / (stats.kpis.totalValueUSD * 25000)) * 100).toFixed(2)}%`
                      : "0.00%"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Volume & Weight */}
            <Card
              title={
                stats?.kpis?.totalContainers
                  ? `Lượng container: ${stats.kpis.totalContainers.toLocaleString("vi-VN")} TEU\nTrọng lượng thực tế: ${(stats.kpis.totalWeightTNE || 0).toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} TNE (Tấn)\nTải trọng trung bình: ${((stats.kpis.totalWeightTNE || 0) / stats.kpis.totalContainers).toFixed(2)} TNE/TEU`
                  : undefined
              }
              className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs hover:border-teal-400 dark:hover:border-teal-500 transition-colors flex flex-col justify-between cursor-help"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Vận chuyển & Container
                </span>
                <div className="size-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Truck className="size-3.5" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3.5 pt-0 flex flex-col justify-between flex-1">
                <div className="text-xl sm:text-2xl font-black tracking-tight tabular-nums text-slate-900 dark:text-white">
                  {formatNumber(stats?.kpis?.totalContainers || 0)}{" "}
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">TEU</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Trọng lượng:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {formatNumber(Math.round(stats?.kpis?.totalWeightTNE || 0))} TNE
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
                      Xu hướng Kim ngạch & Thu ngân sách
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Chuỗi thời gian theo tháng (Kim ngạch USD & Thuế VND)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-72 sm:h-80 px-2 pb-3">
                {!mounted ? (
                  <div className="h-full w-full bg-slate-50/50 dark:bg-slate-800/30 rounded-lg animate-pulse" />
                ) : stats?.trends && stats.trends.length > 0 ? (
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
                        isAnimationActive={true}
                        animationDuration={600}
                        animationEasing="ease-out"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="taxVND"
                        name="Thuế thu được (VND)"
                        stroke="#4F46E5"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: "#4F46E5", strokeWidth: 0 }}
                        isAnimationActive={true}
                        animationDuration={600}
                        animationEasing="ease-out"
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
                  {!mounted ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="size-36 rounded-full border-4 border-slate-100 dark:border-slate-800 animate-pulse" />
                    </div>
                  ) : (
                    <>
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
                            isAnimationActive={true}
                            animationDuration={600}
                            animationEasing="ease-out"
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
                    </>
                  )}
                </div>

                {/* 6-Tax Statutory Micro-Grid Legend with Percentage Indicators */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                  {taxPieData.map((item, idx) => {
                    const pct = stats?.kpis?.totalTaxVND
                      ? ((item.value / stats.kpis.totalTaxVND) * 100).toFixed(1)
                      : "0.0";
                    const shortName = item.name
                      .replace("Thuế Giá trị gia tăng (VAT)", "Thuế GTGT (VAT)")
                      .replace("Thuế Tiêu thụ đặc biệt (TTĐB)", "Thuế TTĐB")
                      .replace("Thuế Bảo vệ môi trường (BVMT)", "Thuế BVMT")
                      .replace("Thuế Tự vệ & Chống bán phá giá", "Tự vệ & CBPG")
                      .replace("Các khoản sắc thuế khác", "Thuế khác");

                    return (
                      <div key={idx} className="flex items-center justify-between text-xs" title={`${item.name}: ${formatVND(item.value)}`}>
                        <div className="flex items-center gap-1.5 truncate max-w-[125px] sm:max-w-[140px]">
                          <span
                            className="size-2 rounded-xs shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="truncate text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                            {shortName}
                          </span>
                        </div>
                        <span className="font-bold tabular-nums text-slate-900 dark:text-white text-[11px] shrink-0 ml-1">
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
                  Nhóm Hàng hóa Trọng điểm
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Xếp hạng theo tổng trị giá quy đổi tiền đồng (VND)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72 sm:h-80 px-2 pb-3">
                {!mounted ? (
                  <div className="h-full w-full bg-slate-50/50 dark:bg-slate-800/30 rounded-lg animate-pulse" />
                ) : stats?.commodities && stats.commodities.length > 0 ? (
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
                        isAnimationActive={true}
                        animationDuration={600}
                        animationEasing="ease-out"
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
                  Phân luồng Tờ khai & Mức độ Tuân thủ
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Đo lường quản lý rủi ro thông quan tự động VNACCS/VCIS
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
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${pct}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Distilled 3-Column Statutory Micro-Grid */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                    <Info className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    Căn cứ Điều 32 Luật Hải quan số 54/2014/QH13:
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] leading-tight">
                    <div
                      title="Thời gian thông quan điện tử: Dưới 3 giây qua hệ thống VNACCS/VCIS (Điều 23 Luật Hải quan)"
                      className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200 cursor-help"
                    >
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">Xanh</span>
                      Miễn kiểm tra hồ sơ và hàng hóa
                    </div>
                    <div
                      title="Thời gian kiểm tra hồ sơ: Không quá 02 giờ làm việc kể từ khi tiếp nhận đủ hồ sơ hải quan (Khoản 2 Điều 23 Luật Hải quan)"
                      className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-amber-950 dark:text-amber-200 cursor-help"
                    >
                      <span className="font-bold text-amber-700 dark:text-amber-400 block mb-0.5">Vàng</span>
                      Kiểm tra chi tiết bộ chứng từ
                    </div>
                    <div
                      title="Thời gian kiểm tra thực tế: Không quá 08 giờ làm việc kể từ khi xuất trình đủ hàng hóa (Khoản 2 Điều 23 Luật Hải quan)"
                      className="p-2 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 text-rose-950 dark:text-rose-200 cursor-help"
                    >
                      <span className="font-bold text-rose-700 dark:text-rose-400 block mb-0.5">Đỏ</span>
                      Kiểm tra chứng từ & thực tế hàng hóa
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
                      Nhận định Điều hành Hải quan
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Đánh giá rủi ro thông quan và dự báo tiến độ thu ngân sách từ mô hình Gemini
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
                    className={`gap-1 text-xs active:scale-95 transition-all duration-150 ${
                      copied
                        ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {copied ? <Check className="size-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="size-3" />}
                    {copied ? "Đã sao chép" : "Sao chép báo cáo"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4 px-6 max-h-[480px] overflow-y-auto print:max-h-none print:overflow-visible">
              {aiLoading ? (
                <div className="py-10 px-4 flex flex-col items-center justify-center space-y-3.5 text-center">
                  <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center animate-pulse shadow-xs">
                    <BrainCircuit className="size-5 animate-spin" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Mô hình AI đang phân tích dữ liệu Hải quan...
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Đang tổng hợp 6 sắc thuế, đo lường tỷ lệ phân luồng thông quan và xây dựng báo cáo nhận định điều hành.
                    </div>
                  </div>
                </div>
              ) : aiInsight ? (
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
          <Card id="enterprises" className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs page-break-avoid scroll-mt-6 [contain:paint_layout]">
            <CardHeader className="pb-3 pt-4 px-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Globe2 className="size-4 text-blue-600" />
                    Top Doanh nghiệp Xuất Nhập Khẩu
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5 flex flex-wrap items-center justify-between gap-1">
                    <span>
                      Xếp hạng theo kim ngạch quy đổi USD và số lượng container
                      {searchQuery.trim() && (
                        <span className="ml-1.5 font-semibold text-blue-600 dark:text-blue-400">
                          (Tìm thấy {filteredEnterprises.length} / {stats?.enterprises?.length || 0} doanh nghiệp)
                        </span>
                      )}
                    </span>
                    <span className="inline-flex sm:hidden text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                      Vuốt ngang xem đủ cột →
                    </span>
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  {/* Search Input with Keyboard Shortcut '/' & Clear Button */}
                  <div className="relative flex-1 md:w-72">
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

                  {/* Excel/CSV Export Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    disabled={!filteredEnterprises || filteredEnterprises.length === 0}
                    className={`gap-1.5 text-xs font-medium shrink-0 active:scale-95 transition-all duration-150 ${
                      csvExported
                        ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                    title="Xuất bảng Top Doanh nghiệp ra file CSV tương thích Excel (chuẩn UTF-8 BOM, bảo toàn số 0 mã số thuế)"
                  >
                    {csvExported ? (
                      <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Download className="size-3.5 text-slate-500 dark:text-slate-400" />
                    )}
                    <span className="hidden sm:inline">{csvExported ? "Đã xuất CSV" : "Xuất CSV"}</span>
                  </Button>
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
                        className={`py-3 px-4 text-right cursor-pointer transition-colors select-none ${
                          sortField === "valueUSD"
                            ? "text-blue-600 dark:text-blue-400 font-black"
                            : "hover:text-blue-600"
                        }`}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Kim ngạch (USD)
                          <ArrowUpDown
                            className={`size-3 transition-transform duration-200 ${
                              sortField === "valueUSD"
                                ? `text-blue-600 dark:text-blue-400 ${
                                    sortOrder === "asc" ? "rotate-180" : ""
                                  }`
                                : "text-slate-400"
                            }`}
                          />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("declarations")}
                        aria-label="Sắp xếp theo Số tờ khai"
                        className={`py-3 px-4 text-center cursor-pointer transition-colors select-none ${
                          sortField === "declarations"
                            ? "text-blue-600 dark:text-blue-400 font-black"
                            : "hover:text-blue-600"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Số Tờ khai
                          <ArrowUpDown
                            className={`size-3 transition-transform duration-200 ${
                              sortField === "declarations"
                                ? `text-blue-600 dark:text-blue-400 ${
                                    sortOrder === "asc" ? "rotate-180" : ""
                                  }`
                                : "text-slate-400"
                            }`}
                          />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("containers")}
                        aria-label="Sắp xếp theo Container TEU"
                        className={`py-3 px-4 text-center cursor-pointer transition-colors select-none ${
                          sortField === "containers"
                            ? "text-blue-600 dark:text-blue-400 font-black"
                            : "hover:text-blue-600"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Container (TEU)
                          <ArrowUpDown
                            className={`size-3 transition-transform duration-200 ${
                              sortField === "containers"
                                ? `text-blue-600 dark:text-blue-400 ${
                                    sortOrder === "asc" ? "rotate-180" : ""
                                  }`
                                : "text-slate-400"
                            }`}
                          />
                        </div>
                      </th>
                      <th className="py-3 px-4 w-20 text-center">Hồ sơ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredEnterprises.map((ent: any, idx: number) => {
                      const rank = idx + 1;
                      const isExpanded = expandedEnterpriseId === ent.taxId;
                      return (
                        <React.Fragment key={ent.taxId || idx}>
                          <tr
                            onClick={() => toggleExpandEnterprise(ent.taxId)}
                            className={`transition-colors font-medium cursor-pointer select-none ${
                              isExpanded
                                ? "bg-blue-50/70 dark:bg-slate-800/80"
                                : "hover:bg-blue-50/30 dark:hover:bg-slate-800/40"
                            }`}
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
                            <td
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyTaxId(ent.taxId);
                              }}
                              title="Bấm để sao chép Mã số thuế"
                              className="py-3 px-4 font-mono text-[11px] whitespace-nowrap cursor-pointer group select-none"
                            >
                              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                <span>{ent.taxId}</span>
                                {copiedTaxId === ent.taxId ? (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 dark:text-emerald-300 font-sans font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-300/60 dark:border-emerald-700/60 shadow-2xs">
                                    <Check className="size-2.5 text-emerald-600 dark:text-emerald-400" /> Đã chép
                                  </span>
                                ) : (
                                  <Copy className="size-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 group-hover:text-blue-600" />
                                )}
                              </div>
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
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpandEnterprise(ent.taxId);
                                }}
                                aria-expanded={isExpanded}
                                aria-label={`${isExpanded ? "Thu gọn" : "Xem"} hồ sơ chi tiết ${ent.name}`}
                                className={`inline-flex items-center justify-center size-7 rounded-lg border transition-all duration-200 cursor-pointer ${
                                  isExpanded
                                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                                }`}
                              >
                                <ChevronDown className={`size-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            </td>
                          </tr>

                          {/* In-situ Enterprise Dossier Card */}
                          {isExpanded && (() => {
                            const spark = computeEnterpriseSparkline(ent);
                            const avgPerDec = ent.declarations ? Math.round(ent.valueUSD / ent.declarations) : 0;
                            const avgPerContainer = ent.containers ? Math.round(ent.valueUSD / ent.containers) : 0;
                            const teuPerDec = ent.declarations ? (ent.containers / ent.declarations).toFixed(1) : "0.0";
                            const complianceLabel = rank <= 3 ? "Doanh nghiệp Ưu tiên (AEO)" : rank <= 10 ? "Hạng 1: Tuân thủ Cao (TT 81/2019/TT-BTC)" : "Hạng 2: Tuân thủ Chuẩn";
                            const complianceClass = rank <= 3
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60"
                              : rank <= 10
                              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300/60 dark:border-blue-700/60"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

                            return (
                              <tr className="bg-slate-50/90 dark:bg-slate-900/90 border-y border-slate-200/80 dark:border-slate-800">
                                <td colSpan={7} className="p-0">
                                  <div className="p-4 md:p-5 space-y-4 animate-in fade-in zoom-in-98 duration-150">
                                    {/* Dossier Top Bar */}
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/80 dark:border-slate-800">
                                      <div className="flex items-start sm:items-center gap-3">
                                        <div className="size-9 rounded-xl bg-blue-100/70 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                                          <Building2 className="size-4.5" />
                                        </div>
                                        <div>
                                          <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                              {ent.name}
                                            </h4>
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${complianceClass}`}>
                                              <ShieldCheck className="size-3" />
                                              {complianceLabel}
                                            </span>
                                          </div>
                                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            <span className="font-mono">MST: {ent.taxId}</span>
                                            <span className="text-slate-300 dark:text-slate-700">•</span>
                                            <span>HQ tiếp nhận: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{getCustomsBranch(ent.name)}</strong></span>
                                            <span className="text-slate-300 dark:text-slate-700">•</span>
                                            <span>Thời gian thông quan: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">~1.5 giây (Luồng Xanh)</strong></span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Quick Actions */}
                                      <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyDossier(ent, rank);
                                          }}
                                          className="gap-1.5 text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs active:scale-95 transition-all duration-150 cursor-pointer"
                                        >
                                          {copiedDossierId === ent.taxId ? (
                                            <>
                                              <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                                              <span>Đã sao chép trích lục</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="size-3 text-slate-500" />
                                              <span>Sao chép trích lục hồ sơ</span>
                                            </>
                                          )}
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleExpandEnterprise(ent.taxId);
                                          }}
                                          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95 transition-all duration-150 cursor-pointer"
                                        >
                                          Thu gọn
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Dossier 3-Column Micro-Analytics */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      
                                      {/* Column 1: Micro Sparkline */}
                                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-2.5">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Xu hướng Kim ngạch 6 Tháng
                                          </span>
                                          <span className="text-[11px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-300/60 dark:border-emerald-700/60">
                                            +{spark.growthPct}% (T6/T1)
                                          </span>
                                        </div>

                                        {/* Crisp SVG Sparkline */}
                                        <div className="py-1">
                                          <svg
                                            viewBox="0 0 240 44"
                                            className="w-full h-11 overflow-visible"
                                            aria-label="Biểu đồ xu hướng kim ngạch 6 tháng"
                                          >
                                            <defs>
                                              <linearGradient id={`spark-grad-${ent.taxId}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                                                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                                              </linearGradient>
                                            </defs>
                                            <path d={spark.areaD} fill={`url(#spark-grad-${ent.taxId})`} />
                                            <path
                                              d={spark.pathD}
                                              fill="none"
                                              stroke="#2563eb"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                            {spark.points.map((pt, pI) => (
                                              <g key={pI}>
                                                <circle
                                                  cx={pt.x}
                                                  cy={pt.y}
                                                  r="2.5"
                                                  className="fill-blue-600 dark:fill-blue-400 ring-2 ring-white dark:ring-slate-900"
                                                />
                                              </g>
                                            ))}
                                          </svg>
                                          <div className="flex justify-between text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                                            {spark.rawData.map((m, mIdx) => (
                                              <span key={mIdx} title={`${m.month}: $${m.val.toLocaleString("en-US")} USD`}>
                                                {m.month}
                                              </span>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                                          <span>Trung bình/tháng:</span>
                                          <strong className="text-slate-800 dark:text-slate-200 font-bold tabular-nums">
                                            {formatUSD(Math.round(ent.valueUSD / 6))}
                                          </strong>
                                        </div>
                                      </div>

                                      {/* Column 2: Logistics & Clearance Performance */}
                                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                                          Chỉ số Vận tải & Tờ khai
                                        </span>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">Trị giá / Tờ khai</div>
                                            <div className="font-bold tabular-nums text-slate-900 dark:text-white mt-0.5">
                                              {formatUSD(avgPerDec)}
                                            </div>
                                          </div>
                                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">Trị giá / TEU</div>
                                            <div className="font-bold tabular-nums text-slate-900 dark:text-white mt-0.5">
                                              {formatUSD(avgPerContainer)}
                                            </div>
                                          </div>
                                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">Mật độ TEU/Tờ khai</div>
                                            <div className="font-bold tabular-nums text-slate-900 dark:text-white mt-0.5">
                                              {teuPerDec} TEU
                                            </div>
                                          </div>
                                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">Tỷ lệ Luồng Xanh</div>
                                            <div className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                                              96.2%
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Column 3: Regimes & Fiscal Profile */}
                                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                                          Cơ cấu Loại hình & Tài khóa
                                        </span>
                                        <div className="space-y-1.5 text-xs">
                                          <div className="flex items-center justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">Quy đổi VND:</span>
                                            <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                                              {formatVND(ent.valueUSD * 25000)}
                                            </span>
                                          </div>
                                          <div className="pt-1.5 space-y-1">
                                            <div className="flex justify-between text-[11px]">
                                              <span className="text-slate-600 dark:text-slate-300">Gia công & SXXK (E21, E31):</span>
                                              <span className="font-bold tabular-nums text-slate-900 dark:text-white">65%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                              <div className="bg-blue-600 h-full rounded-full w-[65%]" />
                                            </div>
                                          </div>
                                          <div className="space-y-1">
                                            <div className="flex justify-between text-[11px]">
                                              <span className="text-slate-600 dark:text-slate-300">Kinh doanh tiêu dùng (A11):</span>
                                              <span className="font-bold tabular-nums text-slate-900 dark:text-white">25%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                              <div className="bg-sky-500 h-full rounded-full w-[25%]" />
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })()}
                        </React.Fragment>
                      );
                    })}
                    {filteredEnterprises.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-10 text-center space-y-2.5">
                          <p className="text-slate-600 dark:text-slate-300 font-medium text-xs">
                            Không tìm thấy doanh nghiệp nào khớp với từ khóa &quot;<span className="font-bold text-slate-900 dark:text-white">{searchQuery}</span>&quot;.
                          </p>
                          <div className="flex items-center justify-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                setSearchQuery("");
                                searchInputRef.current?.focus();
                              }}
                              className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition-colors shadow-2xs"
                            >
                              Xóa bộ lọc tìm kiếm
                            </button>
                          </div>
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

      {/* Command HUD / Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Command className="size-4" />
                </div>
                <div>
                  <h3 id="shortcuts-title" className="text-sm font-bold text-slate-900 dark:text-white">
                    Phím tắt hệ thống (Command HUD)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Thao tác nhanh cho lãnh đạo & chuyên viên Hải quan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                aria-label="Đóng cửa sổ phím tắt"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Shortcut List */}
            <div className="p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Tìm kiếm Doanh nghiệp / MST</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs">
                  /
                </kbd>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Xóa tìm kiếm / Đóng cửa sổ</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs">
                  Esc
                </kbd>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Bật / Tắt giao diện Sáng / Tối</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs">
                  D
                </kbd>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <span className="text-slate-700 dark:text-slate-300 font-medium">In ấn / Xuất báo cáo PDF</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs">
                  P
                </kbd>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Kích hoạt trợ lý AI phân tích</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs">
                  R
                </kbd>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Chuyển kỳ: 6 Tháng / Quý 1 / Quý 2</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs">1</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs">2</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs">3</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Mở bảng trợ giúp phím tắt này</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs">
                  ?
                </kbd>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Bấm phím bất kỳ ngoài ô nhập liệu</span>
              <span className="flex items-center gap-1">
                Nhấn <kbd className="px-1.5 py-0.2 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-[10px]">Esc</kbd> để thoát
              </span>
            </div>
          </div>
        </div>
      )}

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
