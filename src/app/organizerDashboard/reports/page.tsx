"use client";

import {
	ChartLineIcon,
	CalendarCheckIcon,
	UsersIcon,
	CurrencyDollarIcon,
	ArrowUpIcon,
  ArrowDownIcon,
} from "@phosphor-icons/react";

// Placeholder stats data
const statsData = [
	{
		title: "Total Revenue",
		value: "Rs. 0",
		change: "+0%",
		trend: "up" as "up" | "down" | "neutral",
		icon: CurrencyDollarIcon,
		color: "bg-green-100 text-green-600",
	},
	{
		title: "Total Events",
		value: "0",
		change: "+0%",
		trend: "up" as "up" | "down" | "neutral",
		icon: CalendarCheckIcon,
		color: "bg-blue-100 text-blue-600",
	},
	{
		title: "Tickets Sold",
		value: "0",
		change: "+0%",
		trend: "up" as "up" | "down" | "neutral",
		icon: ChartLineIcon,
		color: "bg-purple-100 text-purple-600",
	},
	{
		title: "Total Attendees",
		value: "0",
		change: "+0%",
		trend: "neutral" as "up" | "down" | "neutral",
		icon: UsersIcon,
		color: "bg-orange-100 text-orange-600",
	},
];

export default function ReportsPage() {
	return (
    <div className="flex-1 p-6 space-y-6">
			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statsData.map((stat) => {
					const Icon = stat.icon;
					return (
						<div
							key={stat.title}
							className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
						>
							<div className="flex items-center justify-between">
								<div className={`p-3 rounded-lg ${stat.color}`}>
									<Icon className="w-6 h-6" weight="duotone" />
								</div>
								<div className="flex items-center gap-1 text-sm">
									{stat.trend === "up" && (
										<ArrowUpIcon className="w-4 h-4 text-green-500" />
									)}
									{stat.trend === "down" && (
										<ArrowDownIcon className="w-4 h-4 text-red-500" />
									)}
									<span
										className={
											stat.trend === "up"
												? "text-green-600"
												: stat.trend === "down"
													? "text-red-600"
													: "text-gray-500"
										}
									>
										{stat.change}
									</span>
								</div>
							</div>
							<div className="mt-4">
								<p className="text-2xl font-bold text-gray-900">{stat.value}</p>
								<p className="text-sm text-gray-500 mt-1">{stat.title}</p>
							</div>
						</div>
					);
				})}
			</div>

			{/* Placeholder for charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
					<div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
						<p className="text-gray-400">Chart will be displayed here</p>
					</div>
				</div>
				<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Event</h3>
					<div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
						<p className="text-gray-400">Chart will be displayed here</p>
					</div>
				</div>
			</div>

			{/* Recent Activity */}
			<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
				<div className="text-center py-12 text-gray-400">
					<ChartLineIcon className="w-12 h-12 mx-auto mb-4" weight="duotone" />
					<p>No transactions yet</p>
					<p className="text-sm mt-1">Transaction history will appear here</p>
				</div>
			</div>
		</div>
	);
}
