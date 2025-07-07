"use client";

import Image from "next/image";
import Link from "next/link";
import { convertFileSize, getUsageSummary } from "@/lib/utils";
import { useSimpleTheme } from "@/components/SimpleThemeProvider";
import { Separator } from "@/components/ui/separator";
import { FormattedDateTime } from "@/components/FormattedDateTime";

interface DashboardSummaryProps {
  totalSpace: any;
}

export function DashboardSummary({ totalSpace }: DashboardSummaryProps) {
  const { isDark } = useSimpleTheme();
  
  const usageSummary = getUsageSummary(totalSpace, isDark);

  return (
    <ul className="dashboard-summary-list">
      {usageSummary.map((summary) => (
        <Link
          href={summary.url}
          key={summary.title}
          className="dashboard-summary-card"
        >
          <div className="space-y-4">
            <div className="flex justify-between gap-3">
              <Image
                src={summary.icon}
                width={100}
                height={100}
                alt="uploaded image"
                className="summary-type-icon"
                priority
              />
              <h4 className="summary-type-size">
                {convertFileSize(summary.size) || 0}
              </h4>
            </div>

            <h5 className="summary-type-title">{summary.title}</h5>
            <Separator className="bg-light-400" />
            <FormattedDateTime
              date={summary.latestDate}
              className="text-center"
            />
          </div>
        </Link>
      ))}
    </ul>
  );
}
