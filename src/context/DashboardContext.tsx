"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { DashboardData } from "@/lib/mockData";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export interface BranchOption {
  code: string;
  name: string;
}

export const BRANCH_OPTIONS: BranchOption[] = [
  { code: "ALL", name: "Tất cả các Cục Hải quan" },
  { code: "HQHN", name: "Cục Hải quan TP. Hà Nội" },
  { code: "HQHCM", name: "Cục Hải quan TP. Hồ Chí Minh" },
  { code: "HQHP", name: "Cục Hải quan TP. Hải Phòng" },
  { code: "HQQN", name: "Cục Hải quan tỉnh Quảng Ninh" },
  { code: "HQDN", name: "Cục Hải quan tỉnh Đồng Nai" },
];

export const DATE_PRESETS: Record<string, { label: string; start: string; end: string }> = {
  "first-half-2026": { label: "6 Tháng đầu năm 2026", start: "2026-01-01", end: "2026-06-30" },
  "q1-2026": { label: "Quý 1 / 2026", start: "2026-01-01", end: "2026-03-31" },
  "q2-2026": { label: "Quý 2 / 2026", start: "2026-04-01", end: "2026-06-30" },
  "this-month": { label: "Tháng hiện tại (06/2026)", start: "2026-06-01", end: "2026-06-30" },
  "full-2026": { label: "Cả năm 2026", start: "2026-01-01", end: "2026-12-31" },
};

export function formatVND(val: number): string {
  if (val >= 1e12) return (val / 1e12).toFixed(2) + " nghìn tỷ";
  if (val >= 1e9) return (val / 1e9).toFixed(1) + " tỷ";
  if (val >= 1e6) return (val / 1e6).toFixed(0) + " tr";
  return new Intl.NumberFormat("vi-VN").format(val) + " đ";
}

export function formatUSD(val: number): string {
  if (val >= 1e9) return "$" + (val / 1e9).toFixed(2) + " tỷ";
  if (val >= 1e6) return "$" + (val / 1e6).toFixed(1) + " tr";
  return "$" + new Intl.NumberFormat("en-US").format(val);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat("vi-VN").format(val);
}

interface DashboardContextType {
  data: DashboardData | null;
  loading: boolean;
  refreshing: boolean;
  dbStatus: "live" | "fallback" | "connecting";
  error: string | null;
  datePreset: string;
  setDatePreset: (preset: string) => void;
  branch: string;
  setBranch: (b: string) => void;
  loaiXNK: string;
  setLoaiXNK: (l: string) => void;
  timeframe: string;
  setTimeframe: (t: string) => void;
  startDate: string;
  endDate: string;
  refetch: () => Promise<void>;
  isDarkMode: boolean;
  toggleTheme: () => void;
  showShortcutsModal: boolean;
  setShowShortcutsModal: (show: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  exportPDF: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [datePreset, setDatePresetState] = useState<string>(
    searchParams.get("preset") || "first-half-2026"
  );
  const [branch, setBranchState] = useState<string>(searchParams.get("branch") || "ALL");
  const [loaiXNK, setLoaiXNKState] = useState<string>(searchParams.get("loaiXNK") || "ALL");
  
  // Analytics Engine & Global Filters variables
  const [timeframe, setTimeframeState] = useState<string>(searchParams.get("timeframe") || "Tháng");

  const [searchTerm, setSearchTerm] = useState<string>("");

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<"live" | "fallback" | "connecting">("connecting");
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  const activePreset = DATE_PRESETS[datePreset] || DATE_PRESETS["first-half-2026"];
  const startDate = activePreset.start;
  const endDate = activePreset.end;

  // Initialize theme
  useEffect(() => {
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
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

  const updateQueryParams = useCallback(
    (
      newPreset: string, 
      newBranch: string, 
      newLoaiXNK: string, 
      newTimeframe: string
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("preset", newPreset);
      params.set("branch", newBranch);
      params.set("loaiXNK", newLoaiXNK);
      params.set("timeframe", newTimeframe);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setDatePreset = (preset: string) => {
    setDatePresetState(preset);
    updateQueryParams(preset, branch, loaiXNK, timeframe);
  };

  const setBranch = (b: string) => {
    setBranchState(b);
    updateQueryParams(datePreset, b, loaiXNK, timeframe);
  };

  const setLoaiXNK = (l: string) => {
    setLoaiXNKState(l);
    updateQueryParams(datePreset, branch, l, timeframe);
  };

  const setTimeframe = (t: string) => {
    setTimeframeState(t);
    updateQueryParams(datePreset, branch, loaiXNK, t);
  };

  const fetchData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/stats?startDate=${startDate}&endDate=${endDate}&loaiXNK=${loaiXNK}&branch=${branch}&timeframe=${timeframe}`
        );
        if (!res.ok) {
          throw new Error(`Máy chủ báo lỗi ${res.status}: ${res.statusText}`);
        }
        const json: DashboardData = await res.json();
        setData(json);
        setDbStatus(json.isMock ? "fallback" : "live");
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Không thể tải dữ liệu.");
        setDbStatus("fallback");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [startDate, endDate, loaiXNK, branch, timeframe]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (e.key === "?" && !isInput) {
        e.preventDefault();
        setShowShortcutsModal(true);
      } else if (e.key === "Escape") {
        setShowShortcutsModal(false);
      } else if (!isInput && (e.key === "d" || e.key === "D") && !e.ctrlKey && !e.metaKey) {
        toggleTheme();
      } else if (!isInput && (e.key === "p" || e.key === "P") && !e.ctrlKey && !e.metaKey) {
        window.print();
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
  }, [toggleTheme]);

  const exportPDF = () => {
    window.print();
  };

  const contextValue = useMemo(
    () => ({
      data,
      loading,
      refreshing,
      dbStatus,
      error,
      datePreset,
      setDatePreset,
      branch,
      setBranch,
      loaiXNK,
      setLoaiXNK,
      timeframe,
      setTimeframe,
      startDate,
      endDate,
      refetch: () => fetchData(true),
      isDarkMode,
      toggleTheme,
      showShortcutsModal,
      setShowShortcutsModal,
      searchTerm,
      setSearchTerm,
      exportPDF,
    }),
    [
      data,
      loading,
      refreshing,
      dbStatus,
      error,
      datePreset,
      branch,
      loaiXNK,
      timeframe,
      startDate,
      endDate,
      fetchData,
      isDarkMode,
      toggleTheme,
      showShortcutsModal,
      searchTerm,
    ]
  );

  return <DashboardContext.Provider value={contextValue}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
