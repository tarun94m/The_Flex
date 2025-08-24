import { apiRequest } from "./queryClient";
import type { ReviewFilters, Review, Property } from "@shared/schema";

export interface DashboardMetrics {
  totalReviews: number;
  averageRating: number;
  pendingReviews: number;
  responseRate: number;
  categoryAverages: {
    cleanliness: string;
    communication: string;
    house_rules: string;
  };
  trendsData: Array<{
    week: string;
    rating: number;
    count: number;
  }>;
}

export const api = {
  // Hostaway integration
  async fetchHostawayReviews() {
    const response = await apiRequest("GET", "/api/reviews/hostaway");
    return response.json();
  },

  // Reviews
  async getReviews(filters?: ReviewFilters): Promise<Review[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await apiRequest("GET", `/api/reviews?${params.toString()}`);
    return response.json();
  },

  async getReviewById(id: string): Promise<Review> {
    const response = await apiRequest("GET", `/api/reviews/${id}`);
    return response.json();
  },

  async approveReview(id: string, approvedBy?: string): Promise<Review> {
    const response = await apiRequest("POST", `/api/reviews/${id}/approve`, { approvedBy });
    return response.json();
  },

  async rejectReview(id: string): Promise<Review> {
    const response = await apiRequest("POST", `/api/reviews/${id}/reject`);
    return response.json();
  },

  // Properties
  async getProperties(): Promise<Property[]> {
    const response = await apiRequest("GET", "/api/properties");
    return response.json();
  },

  async getPropertyById(id: string): Promise<Property & { reviews: Review[] }> {
    const response = await apiRequest("GET", `/api/properties/${id}`);
    return response.json();
  },

  // Dashboard
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await apiRequest("GET", "/api/dashboard/metrics");
    return response.json();
  },

  // Google Reviews exploration
  async exploreGoogleReviews() {
    const response = await apiRequest("GET", "/api/google-reviews/explore");
    return response.json();
  },
};
