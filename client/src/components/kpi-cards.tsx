import { Card, CardContent } from "@/components/ui/card";
import { Star, TrendingUp, Clock, MessageCircle } from "lucide-react";
import type { DashboardMetrics } from "@/lib/api";

interface KPICardsProps {
  metrics: DashboardMetrics;
}

export function KPICards({ metrics }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900" data-testid="metric-total-reviews">
                {metrics.totalReviews.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Star className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            12% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900" data-testid="metric-average-rating">
                {metrics.averageRating.toFixed(1)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            0.3 from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900" data-testid="metric-pending-reviews">
                {metrics.pendingReviews}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-2">
            <Clock className="h-3 w-3 inline mr-1" />
            Requires attention
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900" data-testid="metric-response-rate">
                {metrics.responseRate}%
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <MessageCircle className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            2% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
