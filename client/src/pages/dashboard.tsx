import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Sidebar } from "@/components/sidebar";
import { KPICards } from "@/components/kpi-cards";
import { ChartsSection } from "@/components/charts-section";
import { ReviewsTable } from "@/components/reviews-table";
import { ReviewModal } from "@/components/review-modal";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ReviewFilters, Review } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<ReviewFilters>({
    status: 'all',
    categories: ['cleanliness', 'communication', 'respect_house_rules'],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch reviews with filters
  const { data: reviews = [], isLoading: reviewsLoading, refetch: refetchReviews } = useQuery({
    queryKey: ["/api/reviews", filters, searchQuery],
    queryFn: () => api.getReviews({ ...filters, search: searchQuery }),
    staleTime: 30000,
  });

  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: () => api.getDashboardMetrics(),
    staleTime: 60000,
  });

  // Sync Hostaway reviews
  const handleSyncHostaway = async () => {
    try {
      const result = await api.fetchHostawayReviews();
      toast({
        title: "Sync Complete",
        description: `Synced ${result.count} reviews from ${result.source}`,
      });
      refetchReviews();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync reviews from Hostaway API",
        variant: "destructive",
      });
    }
  };

  const handleApplyFilters = () => {
    // Filters are already applied through the query dependency
    toast({
      title: "Filters Applied",
      description: "Review list has been updated with your filters.",
    });
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  if (metricsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-16 flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-16">
        <Sidebar
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
        />

        {/* Main Content */}
        <div className="ml-64 p-6">
          {/* Dashboard Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reviews Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor and manage guest reviews across all properties</p>
            </div>
            <Button
              onClick={handleSyncHostaway}
              variant="outline"
              data-testid="button-sync-hostaway"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Hostaway Reviews
            </Button>
          </div>

          {/* KPI Cards */}
          {metrics && <KPICards metrics={metrics} />}

          {/* Charts Section */}
          {metrics && <ChartsSection metrics={metrics} />}

          {/* Reviews Table */}
          <ReviewsTable
            reviews={reviews}
            isLoading={reviewsLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onViewReview={handleViewReview}
          />
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        review={selectedReview}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
