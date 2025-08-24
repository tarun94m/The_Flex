import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DashboardMetrics } from "@/lib/api";

interface ChartsSectionProps {
  metrics: DashboardMetrics;
}

export function ChartsSection({ metrics }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Rating Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Rating Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  dot={{ fill: "#2563EB" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Cleanliness</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={(parseFloat(metrics.categoryAverages.cleanliness) / 5) * 100} 
                  className="w-32" 
                />
                <span className="text-sm font-semibold text-gray-900" data-testid="category-cleanliness">
                  {metrics.categoryAverages.cleanliness}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Communication</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={(parseFloat(metrics.categoryAverages.communication) / 5) * 100} 
                  className="w-32" 
                />
                <span className="text-sm font-semibold text-gray-900" data-testid="category-communication">
                  {metrics.categoryAverages.communication}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">House Rules</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={(parseFloat(metrics.categoryAverages.house_rules) / 5) * 100} 
                  className="w-32" 
                />
                <span className="text-sm font-semibold text-gray-900" data-testid="category-house-rules">
                  {metrics.categoryAverages.house_rules}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
