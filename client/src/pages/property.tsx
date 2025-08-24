import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Wifi, Tv, Snowflake, UtensilsCrossed, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import type { Property, Review } from "@shared/schema";

export default function PropertyPage() {
  const [, params] = useRoute("/properties/:id");
  const propertyId = params?.id;

  const { data: propertyData, isLoading } = useQuery({
    queryKey: ["/api/properties", propertyId],
    queryFn: () => api.getPropertyById(propertyId!),
    enabled: !!propertyId,
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-16 flex items-center justify-center h-64">
          <div className="text-gray-500">Loading property...</div>
        </div>
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-16 flex items-center justify-center h-64">
          <div className="text-gray-500">Property not found</div>
        </div>
      </div>
    );
  }

  const property = propertyData as Property & { reviews: Review[] };
  const approvedReviews = property.reviews.filter(r => r.approved);
  
  // Calculate averages from approved reviews
  const totalRating = approvedReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  const averageRating = approvedReviews.length > 0 ? totalRating / approvedReviews.length : 0;
  
  const categoryTotals = { cleanliness: 0, communication: 0, respect_house_rules: 0 };
  const categoryCounts = { cleanliness: 0, communication: 0, respect_house_rules: 0 };
  
  approvedReviews.forEach(review => {
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

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Property Images */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <img
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
              alt="Modern apartment interior"
              className="w-full h-96 object-cover rounded-lg"
            />
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
                alt="Modern bedroom"
                className="w-full h-44 object-cover rounded-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1584622781564-1d987f7333c1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
                alt="Modern bathroom"
                className="w-full h-44 object-cover rounded-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
                alt="Modern kitchen"
                className="w-full h-44 object-cover rounded-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
                alt="London street view"
                className="w-full h-44 object-cover rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Property Details */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="property-name">
                  {property.name}
                </h1>
                <p className="text-gray-600" data-testid="property-address">
                  {property.address}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About this space</h2>
                <p className="text-gray-700 leading-relaxed" data-testid="property-description">
                  {property.description}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">High-speed WiFi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tv className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">Smart TV</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Snowflake className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">Air Conditioning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UtensilsCrossed className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">Fully Equipped Kitchen</span>
                  </div>
                </div>
              </div>

              {/* Guest Reviews Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Guest Reviews</h2>
                
                {approvedReviews.length > 0 ? (
                  <>
                    <Card className="bg-gray-50 mb-6">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex text-yellow-400 text-xl">
                              {renderStars(Math.round(averageRating))}
                            </div>
                            <span className="text-2xl font-bold text-gray-900" data-testid="average-rating">
                              {averageRating.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600" data-testid="review-count">
                            Based on {approvedReviews.length} reviews
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cleanliness</span>
                            <span className="font-semibold" data-testid="category-cleanliness-avg">
                              {categoryAverages.cleanliness.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Communication</span>
                            <span className="font-semibold" data-testid="category-communication-avg">
                              {categoryAverages.communication.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">House Rules</span>
                            <span className="font-semibold" data-testid="category-house-rules-avg">
                              {categoryAverages.house_rules.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Individual Reviews (Only Approved) */}
                    <div className="space-y-6">
                      {approvedReviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0" data-testid={`review-${review.id}`}>
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.guestName}`} />
                              <AvatarFallback>{review.guestName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-gray-900" data-testid={`review-guest-${review.id}`}>
                                  {review.guestName}
                                </h4>
                                <span className="text-sm text-gray-500" data-testid={`review-date-${review.id}`}>
                                  {formatDate(review.submittedAt)}
                                </span>
                              </div>
                              <div className="flex text-yellow-400 mb-2">
                                {renderStars(review.rating || 0)}
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed" data-testid={`review-text-${review.id}`}>
                                {review.publicReview}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {approvedReviews.length > 3 && (
                        <Button
                          variant="ghost"
                          className="text-primary hover:text-blue-700"
                          data-testid="button-show-all-reviews"
                        >
                          Show all {approvedReviews.length} reviews
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No approved reviews available for this property yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900" data-testid="property-price">
                          £{property.price}
                        </span>
                        <span className="text-gray-600">/night</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-semibold text-gray-900">
                          {averageRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({approvedReviews.length})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">CHECK-IN</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          data-testid="input-checkin"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">CHECK-OUT</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          data-testid="input-checkout"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">GUESTS</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" data-testid="select-guests">
                        <option value="1">1 guest</option>
                        <option value="2">2 guests</option>
                        <option value="3">3 guests</option>
                        <option value="4">4 guests</option>
                      </select>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-white py-3 hover:bg-blue-700"
                      data-testid="button-reserve"
                    >
                      Reserve
                    </Button>
                  </form>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">£{property.price} × 5 nights</span>
                      <span className="text-gray-900">£{property.price * 5}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service fee</span>
                      <span className="text-gray-900">£{Math.round(property.price * 5 * 0.05)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">£{property.price * 5 + Math.round(property.price * 5 * 0.05)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
