"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Command, X } from "lucide-react";

export function ShortcutsModal() {
  const { showShortcutsModal, setShowShortcutsModal } = useDashboard();

  if (!showShortcutsModal) return null;

  return (
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
                Thao tác nhanh cho lãnh đạo & cán bộ phân tích
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

          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
            <span className="text-slate-700 dark:text-slate-300 font-medium">Đóng cửa sổ phím tắt / Drawer AI</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs">
              Esc
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
  );
}
