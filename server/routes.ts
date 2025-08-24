import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { reviewFiltersSchema, insertReviewSchema } from "@shared/schema";
import axios from "axios";

const HOSTAWAY_ACCOUNT_ID = "61148";
const HOSTAWAY_API_KEY = process.env.HOSTAWAY_API_KEY || "f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152";
const HOSTAWAY_BASE_URL = "https://api.hostaway.com/v1";

export async function registerRoutes(app: Express): Promise<Server> {
  // Hostaway API integration
  app.get("/api/reviews/hostaway", async (req, res) => {
    try {
      // Fetch reviews from Hostaway API
      const response = await axios.get(`${HOSTAWAY_BASE_URL}/reviews`, {
        headers: {
          'Authorization': `Bearer ${HOSTAWAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        params: {
          accountId: HOSTAWAY_ACCOUNT_ID,
        },
      });

      // Normalize the data structure
      const hostawayReviews = response.data.result || [];
      const normalizedReviews = hostawayReviews.map((review: any) => ({
        id: review.id.toString(),
        type: review.type || "guest-to-host",
        status: review.status || "published",
        rating: review.rating || calculateAverageRating(review.reviewCategory),
        publicReview: review.publicReview || "",
        reviewCategory: review.reviewCategory || [],
        submittedAt: new Date(review.submittedAt || Date.now()),
        guestName: review.guestName || "Anonymous Guest",
        listingName: review.listingName || "Unknown Property",
      }));

      // Store reviews in memory
      for (const review of normalizedReviews) {
        await storage.createReview(review);
      }

      res.json({
        status: "success",
        result: normalizedReviews,
        count: normalizedReviews.length,
        source: "hostaway",
      });
    } catch (error: any) {
      console.error("Hostaway API error:", error.message);
      
      // Return mock data if API fails for development purposes
      const mockReviews = [
        {
          id: "7453",
          type: "guest-to-host",
          status: "published",
          rating: 5,
          publicReview: "Shane and family are wonderful! Would definitely host again :)",
          reviewCategory: [
            { category: "cleanliness", rating: 10 },
            { category: "communication", rating: 10 },
            { category: "respect_house_rules", rating: 10 }
          ],
          submittedAt: new Date("2020-08-21T22:45:14Z"),
          guestName: "Shane Finkelstein",
          listingName: "2B N1 A - 29 Shoreditch Heights"
        }
      ];

      // Store mock reviews
      for (const review of mockReviews) {
        await storage.createReview(review);
      }

      res.json({
        status: "success",
        result: mockReviews,
        count: mockReviews.length,
        source: "mock",
        note: "Using mock data due to API unavailability",
      });
    }
  });

  // Get all reviews with filtering
  app.get("/api/reviews", async (req, res) => {
    try {
      const filters = reviewFiltersSchema.parse(req.query);
      const reviews = await storage.getReviews(filters);
      res.json(reviews);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid filter parameters", error: error.message });
    }
  });

  // Get review by ID
  app.get("/api/reviews/:id", async (req, res) => {
    try {
      const review = await storage.getReviewById(req.params.id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch review", error: error.message });
    }
  });

  // Approve review
  app.post("/api/reviews/:id/approve", async (req, res) => {
    try {
      const { approvedBy } = req.body;
      const review = await storage.approveReview(req.params.id, approvedBy || "manager");
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to approve review", error: error.message });
    }
  });

  // Reject review
  app.post("/api/reviews/:id/reject", async (req, res) => {
    try {
      const review = await storage.rejectReview(req.params.id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to reject review", error: error.message });
    }
  });

  // Get properties
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch properties", error: error.message });
    }
  });

  // Get property by ID with approved reviews
  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getPropertyById(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      const approvedReviews = await storage.getApprovedReviewsForProperty(req.params.id);
      res.json({
        ...property,
        reviews: approvedReviews,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch property", error: error.message });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const allReviews = await storage.getReviews();
      const approvedReviews = allReviews.filter(r => r.approved);
      const pendingReviews = allReviews.filter(r => !r.approved);
      
      const totalRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
      const averageRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : "0";
      
      // Calculate category averages
      const categoryTotals = { cleanliness: 0, communication: 0, respect_house_rules: 0 };
      const categoryCounts = { cleanliness: 0, communication: 0, respect_house_rules: 0 };
      
      allReviews.forEach(review => {
        review.reviewCategory?.forEach(cat => {
          if (categoryTotals.hasOwnProperty(cat.category)) {
            categoryTotals[cat.category as keyof typeof categoryTotals] += cat.rating;
            categoryCounts[cat.category as keyof typeof categoryCounts]++;
          }
        });
      });

      const categoryAverages = {
        cleanliness: categoryCounts.cleanliness > 0 ? (categoryTotals.cleanliness / categoryCounts.cleanliness / 10 * 5).toFixed(1) : "0",
        communication: categoryCounts.communication > 0 ? (categoryTotals.communication / categoryCounts.communication / 10 * 5).toFixed(1) : "0",
        house_rules: categoryCounts.respect_house_rules > 0 ? (categoryTotals.respect_house_rules / categoryCounts.respect_house_rules / 10 * 5).toFixed(1) : "0",
      };

      res.json({
        totalReviews: allReviews.length,
        averageRating: parseFloat(averageRating),
        pendingReviews: pendingReviews.length,
        responseRate: 94, // Mock response rate
        categoryAverages,
        trendsData: generateTrendsData(allReviews),
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch metrics", error: error.message });
    }
  });

  // Google Reviews exploration endpoint
  app.get("/api/google-reviews/explore", async (req, res) => {
    try {
      // This is exploration - documenting Google Reviews API capabilities
      res.json({
        status: "explored",
        findings: {
          api: "Google Places API",
          endpoint: "https://maps.googleapis.com/maps/api/place/details/json",
          requirements: [
            "Google Cloud Platform account",
            "Places API enabled",
            "API key with Places API permissions",
            "Place ID for each property"
          ],
          limitations: [
            "Rate limiting: 100,000 requests per day",
            "Cost: $17 per 1000 requests for Place Details",
            "Limited review data compared to full review systems",
            "No direct write access for responses"
          ],
          implementation: {
            feasible: true,
            complexity: "Medium",
            estimated_time: "2-3 days",
            considerations: [
              "Need to obtain Place IDs for all properties",
              "Reviews are read-only",
              "May need to combine with existing Hostaway reviews",
              "Consider caching strategy for API cost optimization"
            ]
          },
          next_steps: [
            "Obtain Google Cloud Platform credentials",
            "Get Place IDs for all Flex Living properties",
            "Implement basic fetch functionality",
            "Add review aggregation logic"
          ]
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to explore Google Reviews", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate average rating from categories
function calculateAverageRating(categories: any[]): number {
  if (!categories || categories.length === 0) return 0;
  const total = categories.reduce((sum, cat) => sum + (cat.rating || 0), 0);
  return Math.round((total / categories.length / 10) * 5 * 10) / 10; // Convert 10-point scale to 5-point
}

// Helper function to generate trends data for charts
function generateTrendsData(reviews: any[]) {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const recentReviews = reviews.filter(r => new Date(r.submittedAt) >= last30Days);
  
  // Group by week
  const weeklyData = [];
  for (let i = 4; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i * 7));
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - ((i - 1) * 7));
    
    const weekReviews = recentReviews.filter(r => {
      const reviewDate = new Date(r.submittedAt);
      return reviewDate >= weekStart && reviewDate < weekEnd;
    });
    
    const avgRating = weekReviews.length > 0 
      ? weekReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / weekReviews.length
      : 0;
    
    weeklyData.push({
      week: `Week ${5 - i}`,
      rating: Math.round(avgRating * 10) / 10,
      count: weekReviews.length,
    });
  }
  
  return weeklyData;
}
