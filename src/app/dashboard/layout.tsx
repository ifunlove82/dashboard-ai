"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Anchor,
  Boxes,
  Building2,
  Users,
  ShieldCheck,
} from "lucide-react";

import AIDrawer from "@/components/AIDrawer";
import { DashboardProvider } from "@/context/DashboardContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ShortcutsModal } from "@/components/dashboard/ShortcutsModal";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navItems: NavItem[] = [
  {
    name: "Tổng quan",
    href: "/dashboard/overview",
    icon: LayoutDashboard,
    description: "Chỉ số tổng hợp & cảnh báo",
  },
  {
    name: "Thu ngân sách",
    href: "/dashboard/revenue",
    icon: Receipt,
    description: "Thuế XNK & Phí CSHT",
  },
  {
    name: "Phí CSHT",
    href: "/dashboard/infrastructure-fee",
    icon: Anchor,
    description: "Phí hạ tầng cảng biển",
  },
  {
    name: "Thông quan",
    href: "/dashboard/clearance",
    icon: Boxes,
    description: "Tờ khai & Phân luồng",
  },
  {
    name: "Doanh nghiệp",
    href: "/dashboard/enterprises",
    icon: Building2,
    description: "Top DN & Mức độ tuân thủ",
  },
  {
    name: "Hiệu suất cán bộ",
    href: "/dashboard/officer-performance",
    icon: Users,
    description: "Năng suất & Thời gian xử lý",
  },
];

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";

  return (
    <div className="flex min-h-screen bg-slate-100/70 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      <AIDrawer />
      <ShortcutsModal />

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 p-5 flex flex-col justify-between shrink-0 hidden md:flex sticky top-0 h-screen">
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

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 block mb-2">
              Phân hệ Chức năng
            </span>
            <nav className="space-y-1" aria-label="Sidebar Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={`${item.href}${query}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70"
                    }`}
                  >
                    <Icon className={`size-4 shrink-0 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      <span
                        className={`text-[10px] leading-tight ${
                          isActive ? "text-blue-100" : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {item.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">VNACCS/VCIS</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              Hải quan VN
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Hệ thống Báo cáo & Điều hành Hải quan số
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Navigation Bar */}
        <header className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sticky top-0 z-20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-blue-700 dark:bg-blue-600 text-white flex items-center justify-center">
                <ShieldCheck className="size-4" />
              </div>
              <span className="font-bold text-xs">VNACCS Intel</span>
            </div>
            <span className="text-[10px] text-slate-500">Hải quan VN</span>
          </div>
          <nav className="flex items-center gap-1 overflow-x-auto pb-1" aria-label="Mobile Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={`${item.href}${query}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] whitespace-nowrap font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </header>

        {/* Executive Filter Header */}
        <DashboardHeader />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global CSS for Print and Vector PDF formatting */}
      <style jsx global>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        @media print {
          body {
            background: white !important;
            color: #0f172a !important;
          }
          aside, header, #ai-drawer-fab {
            display: none !important;
          }
          main {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .page-break-avoid {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen bg-slate-100/70 items-center justify-center text-xs text-slate-500">Đang khởi tạo hệ thống...</div>}>
      <DashboardProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </DashboardProvider>
    </React.Suspense>
  );
}
