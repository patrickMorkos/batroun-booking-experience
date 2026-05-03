import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { useTotalPageViews, useUniqueVisitors, useDailyPageViews, useChaletPageViews, useSocialClicks } from "@/admin/hooks/useAnalytics";
import AdminHeader from "@/admin/components/AdminHeader";
import StatsCard from "@/admin/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Users, Building, TrendingUp, ExternalLink } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const DATE_RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
] as const;

export default function AdminDashboard() {
  const [rangeDays, setRangeDays] = useState(30);

  const endDate = useMemo(() => new Date().toISOString(), []);
  const startDate = useMemo(() => subDays(new Date(), rangeDays).toISOString(), [rangeDays]);

  const { data: totalViews, isError: viewsError } = useTotalPageViews(startDate, endDate);
  const { data: uniqueVisitors, isError: visitorsError } = useUniqueVisitors(startDate, endDate);
  const { data: dailyViews, isError: dailyError } = useDailyPageViews(startDate, endDate);
  const { data: chaletViews, isError: chaletError } = useChaletPageViews(startDate, endDate);
  const { data: socialClicks, isError: socialError } = useSocialClicks(startDate, endDate);

  const hasError = viewsError || visitorsError || dailyError || chaletError || socialError;

  const avgDaily = totalViews && rangeDays ? Math.round(totalViews / rangeDays) : 0;
  const topChalet = chaletViews?.[0]?.chalet_slug || "—";

  const chartData = useMemo(() => {
    return dailyViews?.map((d) => ({
      date: format(new Date(d.day), "MMM d"),
      views: d.count,
    })) || [];
  }, [dailyViews]);

  const chaletChartData = useMemo(() => {
    return chaletViews?.slice(0, 9).map((d) => ({
      name: d.chalet_slug?.replace("o-batroun-", "").replace("-", " ") || "home",
      views: d.count,
    })) || [];
  }, [chaletViews]);

  const SOCIAL_COLORS: Record<string, string> = {
    instagram: "#E1306C",
    tiktok: "#69C9D0",
    facebook: "#1877F2",
  };

  const socialChartData = useMemo(() => {
    return socialClicks?.map((d) => ({
      name: d.platform.charAt(0).toUpperCase() + d.platform.slice(1),
      value: d.count,
      color: SOCIAL_COLORS[d.platform] || "#888",
    })) || [];
  }, [socialClicks]);

  return (
    <div className="flex flex-col min-w-0">
      <AdminHeader title="Dashboard">
        <div className="flex gap-1 items-center flex-wrap">
          {DATE_RANGES.map((range) => (
            <Button
              key={range.days}
              variant={rangeDays === range.days ? "default" : "ghost"}
              size="sm"
              onClick={() => setRangeDays(range.days)}
            >
              {range.label}
            </Button>
          ))}
          <a
            href="https://vercel.com/patrickmorcos-projects/batroun-booking-experience/analytics"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="ml-2">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Vercel Analytics
            </Button>
          </a>
        </div>
      </AdminHeader>

      <div className="p-6 space-y-6 min-w-0">
        {hasError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-center">
            <p className="text-destructive font-medium text-sm">Failed to load some analytics data.</p>
            <p className="text-xs text-muted-foreground mt-1">Please check your connection and refresh the page.</p>
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Page Views" value={totalViews ?? "—"} icon={Eye} description={`Last ${rangeDays} days`} />
          <StatsCard title="Unique Visitors" value={uniqueVisitors ?? "—"} icon={Users} description="By session" />
          <StatsCard title="Avg Daily Views" value={avgDaily} icon={TrendingUp} />
          <StatsCard title="Top Chalet" value={topChalet} icon={Building} description="Most viewed" />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/50 bg-card min-w-0">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Views Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 25%)" />
                    <XAxis dataKey="date" stroke="hsl(220 10% 55%)" fontSize={12} />
                    <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(220 20% 14%)", border: "1px solid hsl(220 15% 25%)", borderRadius: "8px" }}
                      labelStyle={{ color: "hsl(40 20% 90%)" }}
                    />
                    <Line type="monotone" dataKey="views" stroke="hsl(40 60% 50%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                  No data for this period
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card min-w-0">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Views per Chalet</CardTitle>
            </CardHeader>
            <CardContent>
              {chaletChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chaletChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 25%)" />
                    <XAxis dataKey="name" stroke="hsl(220 10% 55%)" fontSize={11} />
                    <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(220 20% 14%)", border: "1px solid hsl(220 15% 25%)", borderRadius: "8px" }}
                      labelStyle={{ color: "hsl(40 20% 90%)" }}
                    />
                    <Bar dataKey="views" fill="hsl(40 60% 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                  No chalet views for this period
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card min-w-0">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Social Link Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              {socialChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={socialChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: "hsl(220 10% 55%)" }}
                      fontSize={13}
                      fill="hsl(40 20% 90%)"
                    >
                      {socialChartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(220 20% 14%)", border: "1px solid hsl(220 15% 25%)", borderRadius: "8px" }}
                      labelStyle={{ color: "hsl(40 20% 90%)" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                  No social clicks for this period
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
