"use client";

import { motion } from "framer-motion";
import { ArrowUpIcon, ArrowDownIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number;
  colorClass?: string;
  isLoading?: boolean;
  index?: number;
}

export function StatCard({
  icon,
  label,
  value,
  change,
  colorClass = "bg-primary/10 text-primary",
  isLoading = false,
  index = 0,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.03 }}
      className="p-4 rounded-2xl glass-card-lowest transition-all"
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClass}`}>{icon}</div>
        {change !== undefined && !isLoading && (
          <div className="flex items-center gap-1 text-sm">
            {isPositive ? (
              <ArrowUpIcon className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 text-red-500" />
            )}
            <span className={isPositive ? "text-green-600" : "text-red-600"}>
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className="mt-4">
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-24 mb-1" />
            <Skeleton className="h-4 w-32 mt-1" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </>
        )}
      </div>
    </motion.div>
  );
}
