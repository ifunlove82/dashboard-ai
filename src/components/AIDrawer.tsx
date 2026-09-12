"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bot, X, Loader2 } from "lucide-react";

export default function AIDrawer() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const fetchInsight = async () => {
    try {
      setIsLoading(true);
      setInsight(null);

      let dataUrl = "/api/stats";
      if (pathname.includes("/revenue")) {
        dataUrl = "/api/v1/revenue";
      } else if (pathname.includes("/clearance")) {
        dataUrl = "/api/v1/clearance";
      }

      // Fetch data for the current route
      const res = await fetch(dataUrl);
      const json = await res.json();
      
      const payloadData = json.data ? json.data : json;

      // Send to AI endpoint
      const aiRes = await fetch("/api/ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payloadData,
          context: pathname,
        }),
      });

      const aiJson = await aiRes.json();
      setInsight(aiJson.insight || aiJson.error || "No insight available.");
    } catch (error: any) {
      setInsight("Failed to fetch insight: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset insight when route changes so it forces a new fetch when opened
  useEffect(() => {
    setInsight(null);
  }, [pathname]);

  useEffect(() => {
    if (isOpen && !insight && !isLoading) {
      fetchInsight();
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-40 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
        aria-label="Toggle AI Insight"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] max-w-full bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500">
            <Bot className="w-5 h-5" />
            <h2 className="font-bold text-slate-800 dark:text-slate-100">AI Context Insight</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p>Analyzing {pathname} data...</p>
            </div>
          ) : insight ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {/* Very basic markdown rendering using pre-wrap to preserve formatting */}
              <div className="whitespace-pre-wrap">{insight}</div>
            </div>
          ) : (
            <div className="text-center text-slate-500 mt-10">
              <p>No insights loaded.</p>
              <button 
                onClick={fetchInsight}
                className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
              >
                Fetch Now
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
