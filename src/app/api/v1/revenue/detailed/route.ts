import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unit = searchParams.get("unit");
  const taxType = searchParams.get("taxType");
  const enterprise = searchParams.get("enterprise");

  // Giả lập biến động dựa trên drill-down
  const multiplier = enterprise ? 0.05 : taxType ? 0.2 : unit ? 0.4 : 1;

  const mockData = {
    kpis: {
      currentPeriod: 500 * multiplier,
      ytd: 12000 * multiplier,
      yoy: 12.5,
      previousPeriod: 450 * multiplier,
      target: 15000 * multiplier,
      stretchTarget: 16000 * multiplier,
      completionPct: 80,
      remaining: 3000 * multiplier
    },
    charts: {
      last6Periods: Array.from({length: 6}, (_, i) => ({ name: `Kỳ ${i+1}`, value: 100 * multiplier * (i+1) })),
      byUnit: [
        { id: 'hanoi', name: 'HQ Hà Nội', value: 4000 * multiplier },
        { id: 'hcm', name: 'HQ HCM', value: 5000 * multiplier }
      ],
      byTaxType: [
        { id: 'vat', name: 'VAT', value: 8000 * multiplier, color: '#3b82f6' },
        { id: 'nk', name: 'Nhập Khẩu', value: 4000 * multiplier, color: '#10b981' }
      ],
      byImportExport: [
        { name: 'Nhập Khẩu', value: 65, color: '#f59e0b' },
        { name: 'Xuất Khẩu', value: 35, color: '#8b5cf6' }
      ],
      byCommodityGroup: [
        { name: 'Điện tử', value: 5000 * multiplier },
        { name: 'Nông sản', value: 3000 * multiplier }
      ],
      correlation: Array.from({length: 12}, (_, i) => ({
        name: `T${i+1}`, 
        turnover: Math.round(1000 + (Math.random() * 500)), 
        revenue: Math.round(100 + (Math.random() * 50))
      }))
    },
    tops: {
      enterprises: Array.from({length: 20}, (_, i) => ({ id: `dn-${i}`, name: `Doanh nghiệp ${i}`, tax: 1000 - i*10 })),
      regimes: Array.from({length: 5}, (_, i) => ({ name: `Loại hình ${i}`, value: 500 - i*50 })),
      commodities: Array.from({length: 5}, (_, i) => ({ name: `Nhóm ${i}`, value: 400 - i*40 }))
    },
    declarations: Array.from({length: 10}, (_, i) => ({
      id: `TK-${1000+i}`, date: '2026-09-13', type: 'Nhập kinh doanh', tax: 50
    }))
  };

  return NextResponse.json(mockData);
}
