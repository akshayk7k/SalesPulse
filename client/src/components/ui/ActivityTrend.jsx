"use client";
import React from "react";
import { TrendingUp, CalendarIcon } from "lucide-react";
import { subDays } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "./chart";
import DatePickerWithRange from "./DateRangePicker";

export default function ActivityTrends({ activities, emailData, contact }) {
  const monthsSet = new Set();
  const [dateRange, setDateRange] = React.useState([
    subDays(new Date(), 90),
    new Date(),
  ]);

  if (!dateRange || !dateRange[0] || !dateRange[1]) {
    return (
      <div className="w-full text-left space-y-4">
        <div className="flex flex-col space-y-1.5 pb-3 border-b border-slate-900/50">
          <h2 className="text-base font-semibold text-white">Activity Trends</h2>
          <p className="text-xs text-slate-400">Email and meeting activity trends over time</p>
        </div>
        <DatePickerWithRange
          setDateRange={setDateRange}
          dateRange={dateRange}
        />
        <div className="text-sm text-slate-500 py-4 font-light">Please select a date range.</div>
      </div>
    );
  }

  let from = new Date(dateRange[0]);
  let to = new Date(dateRange[1]);
  
  while (true) {
    if (from > to) break;
    const monthYear = from.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
    monthsSet.add(monthYear);
    from = new Date(from.getFullYear(), from.getMonth() + 1);
  }

  const labels = Array.from(monthsSet).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const Values = [34, 27, 23, 34, 42, 51, 49, 45, 38, 33];
  
  const chartData = labels.map((month) => ({
    month,
    inbound: Values[Math.floor(Math.random() * Values.length)],
    outbound: Values[Math.floor(Math.random() * Values.length)],
    meeting: Values[Math.floor(Math.random() * Values.length)],
  }));

  const chartConfig = {
    inbound: { label: "Inbound", color: "#06b6d4" },
    outbound: { label: "Outbound", color: "#6366f1" },
    meeting: { label: "Meeting", color: "#f59e0b" },
  };

  return (
    <div className="w-full text-left space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-900/50">
        <div>
          <h2 className="text-base font-semibold text-white">Activity Trends</h2>
          <p className="text-xs text-slate-500 font-light mt-0.5">Email and meeting activity trends over time</p>
        </div>
        <div>
          <DatePickerWithRange
            setDateRange={setDateRange}
            dateRange={dateRange}
          />
        </div>
      </div>

      <div className="pt-2">
        <ChartContainer config={chartConfig} className="max-h-[300px]">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 8, right: 8, top: 8 }}
          >
            <CartesianGrid vertical={false} stroke="#1e293b/30" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              stroke="#64748b"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <defs>
              <linearGradient id="fillOutbound" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#6366f1"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="#6366f1"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fillInbound" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#06b6d4"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="#06b6d4"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fillMeeting" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#f59e0b"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="#f59e0b"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="outbound"
              type="natural"
              fill="url(#fillOutbound)"
              fillOpacity={0.2}
              stroke="#6366f1"
              strokeWidth={1.5}
              stackId="a"
            />
            <Area
              dataKey="inbound"
              type="natural"
              fill="url(#fillInbound)"
              fillOpacity={0.2}
              stroke="#06b6d4"
              strokeWidth={1.5}
              stackId="a"
            />
            <Area
              dataKey="meeting"
              type="natural"
              fill="url(#fillMeeting)"
              fillOpacity={0.2}
              stroke="#f59e0b"
              strokeWidth={1.5}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="flex w-full items-start gap-2 text-xs text-slate-500 pt-2 border-t border-slate-900/30">
        <div className="grid gap-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            Trends of Activity <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="font-light">
            Range: {labels[0]} - {labels[labels.length - 1]}
          </div>
        </div>
      </div>
    </div>
  );
}
