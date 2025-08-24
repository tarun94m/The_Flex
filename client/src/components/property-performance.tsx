import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import type { Property, Review } from "@shared/schema";

interface PropertyPerformanceProps {
  properties: Property[];
  reviews: Review[];
  metrics: any;
}

export function PropertyPerformance({ properties, reviews, metrics }: PropertyPerformanceProps) {
  
  const propertyStats = useMemo(() => {
    return properties.map(property => {
      const propertyReviews = reviews.filter(r => r.listingName.includes(property.name));
      const approvedReviews = propertyReviews.filter(r => r.approved);
      const pendingReviews = propertyReviews.filter(r => !r.approved);
      
      // Calculate averages
      const totalRating = propertyReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
      const averageRating = propertyReviews.length > 0 ? totalRating / propertyReviews.length : 0;
      
      // Category averages
      const categoryTotals = { cleanliness: 0, communication: 0, respect_house_rules: 0 };
      const categoryCounts = { cleanliness: 0, communication: 0, respect_house_rules: 0 };
      
      propertyReviews.forEach(review => {
        review.reviewCategory?.forEach(cat => {
          if (categoryTotals.hasOwnProperty(cat.category)) {
            categoryTotals[cat.category as keyof typeof categoryTotals] += cat.rating;
            categoryCounts[cat.category as keyof typeof categoryCounts]++;
          }
        });
      });

      const categoryAverages = {
        cleanliness: categoryCounts.cleanliness > 0 ? (categoryTotals.cleanliness / categoryCounts.cleanliness / 10 * 5) : 0,
        communication: categoryCounts.communication > 0 ? (categoryTotals.communication / categoryCounts.communication / 10 * 5) : 0,
        house_rules: categoryCounts.respect_house_rules > 0 ? (categoryTotals.respect_house_rules / categoryCounts.respect_house_rules / 10 * 5) : 0,
      };

      // Channel breakdown
      const channelBreakdown = propertyReviews.reduce((acc, review) => {
        const channel = review.channel || 'unknown';
        acc[channel] = (acc[channel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Trend analysis (comparing last 30 days to previous 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      
      const recentReviews = propertyReviews.filter(r => new Date(r.submittedAt) >= thirtyDaysAgo);
      const previousReviews = propertyReviews.filter(r => 
        new Date(r.submittedAt) >= sixtyDaysAgo && new Date(r.submittedAt) < thirtyDaysAgo
      );
      
      const recentAvg = recentReviews.length > 0 ? 
        recentReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / recentReviews.length : 0;
      const previousAvg = previousReviews.length > 0 ? 
        previousReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / previousReviews.length : 0;
      
      const trend = recentAvg - previousAvg;

      // Identify recurring issues
      const lowRatingReviews = propertyReviews.filter(r => (r.rating || 0) <= 3);
      const commonIssues = lowRatingReviews.map(r => r.publicReview)
        .filter(review => review && review.length > 0)
        .flatMap(review => {
          const keywords = ['dirty', 'clean', 'noise', 'wifi', 'internet', 'broken', 'cold', 'hot', 'smell'];
          return keywords.filter(keyword => 
            review!.toLowerCase().includes(keyword)
          );
        })
        .reduce((acc, keyword) => {
          acc[keyword] = (acc[keyword] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const topIssues = Object.entries(commonIssues)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      return {
        property,
        totalReviews: propertyReviews.length,
        approvedReviews: approvedReviews.length,
        pendingReviews: pendingReviews.length,
        averageRating,
        categoryAverages,
        channelBreakdown,
        trend,
        recentReviews: recentReviews.length,
        topIssues,
        approvalRate: propertyReviews.length > 0 ? (approvedReviews.length / propertyReviews.length) * 100 : 0
      };
    });
  }, [properties, reviews]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0.2) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < -0.2) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />; // Empty space for neutral
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0.2) return "text-green-600";
    if (trend < -0.2) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Property Performance Analysis</h2>
        <Badge variant="outline" className="text-xs">
          Last 30 days vs Previous 30 days
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {propertyStats.map((stats) => (
          <Card key={stats.property.id} className="hover:shadow-lg transition-shadow" data-testid={`property-card-${stats.property.id}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="truncate">{stats.property.name}</span>
                {getTrendIcon(stats.trend)}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <div className="flex">{renderStars(Math.round(stats.averageRating))}</div>
                <span className="font-semibold" data-testid={`property-rating-${stats.property.id}`}>
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className={`text-sm ${getTrendColor(stats.trend)}`}>
                  {stats.trend > 0 ? '+' : ''}{stats.trend.toFixed(1)}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Review Statistics */}
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="font-bold text-lg" data-testid={`total-reviews-${stats.property.id}`}>
                    {stats.totalReviews}
                  </div>
                  <div className="text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-green-600" data-testid={`approved-reviews-${stats.property.id}`}>
                    {stats.approvedReviews}
                  </div>
                  <div className="text-gray-500">Approved</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-orange-600" data-testid={`pending-reviews-${stats.property.id}`}>
                    {stats.pendingReviews}
                  </div>
                  <div className="text-gray-500">Pending</div>
                </div>
              </div>

              {/* Approval Rate */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Approval Rate</span>
                  <span className="font-semibold">{stats.approvalRate.toFixed(0)}%</span>
                </div>
                <Progress value={stats.approvalRate} className="h-2" />
              </div>

              {/* Category Breakdown */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Category Ratings</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-semibold" data-testid={`cleanliness-${stats.property.id}`}>
                      {stats.categoryAverages.cleanliness.toFixed(1)}
                    </div>
                    <div className="text-gray-500">Clean</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold" data-testid={`communication-${stats.property.id}`}>
                      {stats.categoryAverages.communication.toFixed(1)}
                    </div>
                    <div className="text-gray-500">Comm</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold" data-testid={`house-rules-${stats.property.id}`}>
                      {stats.categoryAverages.house_rules.toFixed(1)}
                    </div>
                    <div className="text-gray-500">Rules</div>
                  </div>
                </div>
              </div>

              {/* Channel Breakdown */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Review Sources</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(stats.channelBreakdown).map(([channel, count]) => (
                    <Badge key={channel} variant="outline" className="text-xs">
                      {channel}: {count}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Recurring Issues */}
              {stats.topIssues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                    Common Issues
                  </h4>
                  <div className="space-y-1">
                    {stats.topIssues.map(([issue, count]) => (
                      <div key={issue} className="flex justify-between text-xs">
                        <span className="capitalize">{issue}</span>
                        <span className="text-gray-500">{count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Indicators */}
              <div className="flex items-center justify-between pt-2 border-t">
                {stats.pendingReviews > 0 ? (
                  <Badge variant="secondary" className="text-xs">
                    {stats.pendingReviews} awaiting review
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    All caught up
                  </Badge>
                )}
                <span className="text-xs text-gray-500">
                  {stats.recentReviews} recent
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {propertyStats.filter(s => s.averageRating >= 4.5).length}
              </div>
              <div className="text-sm text-gray-600">High Performers (4.5+)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {propertyStats.filter(s => s.pendingReviews > 0).length}
              </div>
              <div className="text-sm text-gray-600">Need Attention</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {propertyStats.reduce((sum, s) => sum + s.recentReviews, 0)}
              </div>
              <div className="text-sm text-gray-600">Recent Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(propertyStats.reduce((sum, s) => sum + s.approvalRate, 0) / propertyStats.length).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Avg Approval Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}