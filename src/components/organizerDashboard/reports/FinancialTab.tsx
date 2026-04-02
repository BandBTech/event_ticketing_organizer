"use client";

import {
  CurrencyDollarIcon,
  ArrowDownIcon,
  ChartBarIcon,
} from "@phosphor-icons/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useReport } from "@/hooks/useReports";
import { FinancialReportData } from "@/types/report";
import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

interface FinancialTabProps {
  startDate?: string;
  endDate?: string;
}

export function FinancialTab({ startDate, endDate }: FinancialTabProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { data, isLoading } = useReport("financial", {
    start_date: startDate,
    end_date: endDate,
  });

  const report = data as FinancialReportData | undefined;
  const revVsExp = report?.revenue_vs_expenses ?? [];
  const commissionBreakdown = report?.commission_breakdown ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<CurrencyDollarIcon className="w-6 h-6" weight="duotone" />}
          label={t("reports.financial.totalRevenue", "Total Revenue")}
          value={formatCurrency(report?.total_revenue ?? 0)}
          colorClass="bg-green-100 text-green-600"
          isLoading={isLoading}
          index={0}
        />
        <StatCard
          icon={<ArrowDownIcon className="w-6 h-6" weight="duotone" />}
          label={t("reports.financial.totalExpenses", "Total Expenses")}
          value={formatCurrency(report?.total_expenses ?? 0)}
          colorClass="bg-red-100 text-red-600"
          isLoading={isLoading}
          index={1}
        />
        <StatCard
          icon={<ChartBarIcon className="w-6 h-6" weight="duotone" />}
          label={t("reports.financial.netIncome", "Net Income")}
          value={formatCurrency(report?.net_income ?? 0)}
          colorClass="bg-blue-100 text-blue-600"
          isLoading={isLoading}
          index={2}
        />
      </div>

      <ChartCard
        title={t("reports.financial.revenueVsExpenses", "Revenue vs Expenses")}
        isLoading={isLoading}
        isEmpty={!isLoading && revVsExp.length === 0}
      >
        <ResponsiveContainer width="100%" height={256}>
          <LineChart data={revVsExp}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name={t("reports.financial.revenue", "Revenue")}
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name={t("reports.financial.expenses", "Expenses")}
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {(isLoading || commissionBreakdown.length > 0) && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("reports.financial.commissionBreakdown", "Commission Breakdown")}</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {commissionBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
              {report?.commission_total !== undefined && (
                <div className="flex justify-between items-center py-2 pt-3">
                  <span className="text-sm font-semibold text-gray-900">{t("reports.financial.totalCommission", "Total Commission")}</span>
                  <span className="text-sm font-bold text-primary">
                    {formatCurrency(report.commission_total)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
