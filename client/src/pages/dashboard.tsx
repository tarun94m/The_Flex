import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Sidebar } from "@/components/sidebar";
import { KPICards } from "@/components/kpi-cards";
import { ChartsSection } from "@/components/charts-section";
import { ReviewsTable } from "@/components/reviews-table";
import { ReviewModal } from "@/components/review-modal";
import { PropertyPerformance } from "@/components/property-performance";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, BarChart3, Table, TrendingUp } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("overview");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

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

  // Fetch properties for performance analysis
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => api.getProperties(),
    staleTime: 300000,
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

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Sort reviews based on current sort config
  const sortedReviews = [...reviews].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { key, direction } = sortConfig;
    let aVal: any = a[key as keyof Review];
    let bVal: any = b[key as keyof Review];
    
    // Handle date sorting
    if (key === 'submittedAt') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    // Handle rating sorting
    if (key === 'rating') {
      aVal = aVal || 0;
      bVal = bVal || 0;
    }
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

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

          {/* Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="overview" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Property Performance
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center">
                <Table className="h-4 w-4 mr-2" />
                Review Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* KPI Cards */}
              {metrics && <KPICards metrics={metrics} />}
              
              {/* Charts Section */}
              {metrics && <ChartsSection metrics={metrics} />}
            </TabsContent>

            <TabsContent value="properties" className="space-y-6">
              <PropertyPerformance 
                properties={properties}
                reviews={reviews}
                metrics={metrics}
              />
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              {/* Reviews Table */}
              <ReviewsTable
                reviews={sortedReviews}
                isLoading={reviewsLoading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onViewReview={handleViewReview}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TabsContent>
          </Tabs>
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
