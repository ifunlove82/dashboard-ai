import { Card } from "@/components/ui/card";

export function RevenueDeclarationTable({ declarations }: { declarations: any[] }) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + " tỷ VNĐ";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-base text-slate-900 dark:text-white">
          Danh sách Tờ khai (Mức độ chi tiết sâu nhất)
        </h4>
        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-medium">
          {declarations?.length || 0} tờ khai
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              <th className="py-3 px-3">Số TK</th>
              <th className="py-3 px-3">Ngày</th>
              <th className="py-3 px-3">Loại hình</th>
              <th className="py-3 px-3 text-right">Thuế nộp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {declarations?.map((tk) => (
              <tr
                key={tk.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-3 px-3 font-mono text-slate-900 dark:text-white font-medium">
                  {tk.id}
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                  {tk.date}
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                  {tk.type}
                </td>
                <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(tk.tax)}
                </td>
              </tr>
            ))}
            {(!declarations || declarations.length === 0) && (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  Không có dữ liệu tờ khai
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
