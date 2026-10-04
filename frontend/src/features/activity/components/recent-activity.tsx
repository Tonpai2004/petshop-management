"use client";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { AccentTitle } from "@/components/shared/accent-title";
import { useRecentActivity } from "../hooks/use-activity";
import { ActivityList } from "./activity-list";

export function RecentActivity() {
  const { data, isLoading } = useRecentActivity(8);

  return (
    <Card className="h-full">
      <CardHeader>
        <AccentTitle>Recent activity</AccentTitle>
        <CardDescription>What the team has been up to</CardDescription>
      </CardHeader>
      <CardContent>
        <ActivityList items={data} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}
