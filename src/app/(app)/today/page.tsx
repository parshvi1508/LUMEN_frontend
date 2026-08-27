"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { TodayWorklist } from "@/features/today/TodayWorklist";

export default function TodayPage() {
  return (
    <>
      <PageHeader
        title="Today's actions"
        description="Ranked by expected value. Pick a customer, launch a win-back, close the loop."
      />
      <div className="px-6 md:px-8 py-6">
        <TodayWorklist />
      </div>
    </>
  );
}
