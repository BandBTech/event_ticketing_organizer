"use client";

import { UsersIcon, UserPlusIcon, ArrowsClockwiseIcon } from "@phosphor-icons/react";
import {
  PieChart,
  Pie,
  Cell,
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
import { CustomerAnalyticsData } from "@/types/report";
import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface CustomerAnalyticsTabProps {
  startDate?: string;
  endDate?: string;
}

export function CustomerAnalyticsTab({ startDate, endDate }: CustomerAnalyticsTabProps) {
  const { data, isLoading } = useReport("customer-analytics", {
    start_date: startDate,
    end_date: endDate,
  });

  const report = data as CustomerAnalyticsData | undefined;
  const demographics = report?.demographics ?? [];
  const customerGrowth = report?.customer_growth ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<UsersIcon className="w-6 h-6" weight="duotone" />}
          label="Total Customers"
          value={(report?.total_customers ?? 0).toLocaleString()}
          colorClass="bg-blue-100 text-blue-600"
          isLoading={isLoading}
          index={0}
        />
        <StatCard
          icon={<UserPlusIcon className="w-6 h-6" weight="duotone" />}
          label="New Customers"
          value={(report?.new_customers ?? 0).toLocaleString()}
          colorClass="bg-green-100 text-green-600"
          isLoading={isLoading}
          index={1}
        />
        <StatCard
          icon={<ArrowsClockwiseIcon className="w-6 h-6" weight="duotone" />}
          label="Repeat Customers"
          value={(report?.repeat_customers ?? 0).toLocaleString()}
          colorClass="bg-purple-100 text-purple-600"
          isLoading={isLoading}
          index={2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Customer Demographics"
          isLoading={isLoading}
          isEmpty={!isLoading && demographics.length === 0}
        >
          <ResponsiveContainer width="100%" height={256}>
            <PieChart>
              <Pie
                data={demographics}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {demographics.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Customer Growth"
          isLoading={isLoading}
          isEmpty={!isLoading && customerGrowth.length === 0}
        >
          <ResponsiveContainer width="100%" height={256}>
            <LineChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="customers"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
