import { useStats } from "@/hooks/use-stats";
import { LayoutShell } from "@/components/layout-shell";
import { StatCard } from "@/components/stat-card";
import { HardHat, Users, AlertTriangle, Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading } = useStats();

  const chartData = [
    { name: "Week 1", hours: 420 },
    { name: "Week 2", hours: 380 },
    { name: "Week 3", hours: 510 },
    { name: "Week 4", hours: 450 },
  ];

  return (
    <LayoutShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of operations and key performance indicators.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
          ) : (
            <>
              <StatCard
                title="Active Projects"
                value={stats?.activeProjects || 0}
                icon={HardHat}
                description="Currently in progress"
                className="border-l-primary"
              />
              <StatCard
                title="Total Employees"
                value={stats?.totalEmployees || 0}
                icon={Users}
                description="Active staff members"
                className="border-l-blue-500"
              />
              <StatCard
                title="Low Stock Items"
                value={stats?.lowStockItems || 0}
                icon={AlertTriangle}
                description="Requires reordering"
                className="border-l-yellow-500"
              />
              <StatCard
                title="Equipment In Use"
                value={stats?.equipmentInUse || 0}
                icon={Truck}
                description="Deployed to sites"
                className="border-l-green-500"
              />
            </>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <CardTitle className="font-display tracking-wide uppercase">Labor Hours (Last 4 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.6)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <CardTitle className="font-display tracking-wide uppercase">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border/50">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Material Restock Order #{2000 + i}</p>
                      <p className="text-xs text-muted-foreground">Updated 2 hours ago by John Doe</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutShell>
  );
}
