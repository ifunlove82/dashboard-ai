import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function RevenueKPIs({ kpis }: { kpis: any }) {
  if (!kpis) return null;
  const format = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + " tỷ VNĐ";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">Thu kỳ báo cáo</p>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{format(kpis.currentPeriod)}</h3>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">Thu YTD</p>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{format(kpis.ytd)}</h3>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">YoY</p>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{kpis.yoy > 0 ? `+${kpis.yoy}%` : `${kpis.yoy}%`}</h3>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">Kỳ trước</p>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{format(kpis.previousPeriod)}</h3>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">Chỉ tiêu giao</p>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{format(kpis.target)}</h3>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">Phấn đấu</p>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{format(kpis.stretchTarget)}</h3>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">% Hoàn thành</p>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{kpis.completionPct}%</h3>
        <Progress value={kpis.completionPct} className="h-1.5 mt-2" />
      </Card>
      <Card className="p-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">Còn phải thu</p>
        <h3 className="text-xl font-bold text-rose-500 dark:text-rose-400">{format(kpis.remaining)}</h3>
      </Card>
    </div>
  );
}
