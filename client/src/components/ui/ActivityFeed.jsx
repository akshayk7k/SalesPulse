"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Sparkles } from "lucide-react";
import { subDays } from "date-fns";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";
import DatePickerWithRange from "./DateRangePicker";

export function ActivityFeed({ activities, contact }) {
  const [dateRange, setDateRange] = React.useState([
    subDays(new Date(), 90),
    new Date(),
  ]);

  if (
    !dateRange ||
    !dateRange[0] ||
    !dateRange[1] ||
    dateRange[0] === "Invalid Date" ||
    dateRange[1] === "Invalid Date"
  ) {
    return (
      <div className="w-full text-left space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-900/50">
          <h2 className="text-base font-semibold text-white">Latest Activity</h2>
        </div>
        <DatePickerWithRange
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        <p className="text-sm text-slate-400 font-light">Please select date range</p>
      </div>
    );
  }

  const filteredActivities = activities.filter((activity) => {
    if (
      (new Date(activity.ACTIVITY_DATE_TIME) <= dateRange[1] &&
        new Date(activity.ACTIVITY_DATE_TIME) >= dateRange[0]) ||
      (new Date(activity.Date) <= dateRange[1] &&
        new Date(activity.Date) >= dateRange[0])
    ) {
      return true;
    }
    return false;
  });

  return (
    <div className="w-full text-left space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-900/50">
        <h2 className="text-base font-semibold text-white">Latest Activity</h2>
      </div>
      
      <div className="pb-1">
        <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      <ScrollArea className="h-[210px] pr-2">
        <div className="relative">
          <div className="absolute left-[12px] top-2 bottom-2 w-[1.5px] bg-slate-800" />
          <ul className="space-y-4 relative">
            {filteredActivities.length === 0 && (
              <p className="text-sm text-slate-500 italic py-4">No activities found in selected range.</p>
            )}
            {filteredActivities.map((activity, index) => (
              <li key={index} className="pl-7 relative">
                <div
                  className={`absolute left-[5px] top-[6px] h-3.5 w-3.5 rounded-full border-2 border-slate-900 shadow-md ${
                    activity.EmailId
                      ? activity.FromAddress === contact.EMAIL
                        ? "bg-cyan-500"
                        : "bg-indigo-500"
                      : "bg-amber-500"
                  }`}
                  style={{
                    boxShadow: activity.EmailId
                      ? activity.FromAddress === contact.EMAIL
                        ? "0 0 8px rgba(6, 182, 212, 0.4)"
                        : "0 0 8px rgba(99, 102, 241, 0.4)"
                      : "0 0 8px rgba(245, 158, 11, 0.4)"
                  }}
                />

                {activity.EmailId ? (
                  <div className="p-1 rounded text-left">
                    {activity.FromAddress === contact.EMAIL ? (
                      <p className="text-xs text-slate-300 font-light leading-relaxed">
                        <span className="font-semibold text-slate-100">
                          {contact.FIRST_NAME} {contact.LAST_NAME}
                        </span>{" "}
                        sent an email to{" "}
                        <span className="text-cyan-400 font-medium">
                          Customer
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-300 font-light leading-relaxed">
                        <span className="font-semibold text-slate-100">Customer</span> sent
                        an email to{" "}
                        <span className="text-indigo-400 font-medium">
                          {contact.FIRST_NAME} {contact.LAST_NAME}
                        </span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-1 rounded text-left">
                    <p className="text-xs text-slate-300 font-light leading-relaxed">
                      <span className="font-semibold text-slate-100">Customer</span> logged a
                      meeting with{" "}
                      <span className="text-amber-400 font-medium">
                        {contact.FIRST_NAME} {contact.LAST_NAME}
                      </span>
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </ScrollArea>
    </div>
  );
}
