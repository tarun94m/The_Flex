import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Wifi, Tv, Snowflake, UtensilsCrossed, ChevronRight, Globe } from "lucide-react";
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

  // Google Reviews integration (demonstration)
  const { data: googleReviewsData } = useQuery({
    queryKey: ["/api/google-reviews", propertyId],
    queryFn: () => api.getGoogleReviews(propertyId!),
    enabled: !!propertyId,
    staleTime: 300000, // 5 minutes
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

              {/* Guest Reviews Section - Enhanced Flex Living Style */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">What guests are saying</h2>
                  {approvedReviews.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="flex text-yellow-400">
                        {renderStars(Math.round(averageRating))}
                      </div>
                      <span className="text-lg font-semibold text-gray-900" data-testid="average-rating">
                        {averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-500" data-testid="review-count">
                        ({approvedReviews.length} reviews)
                      </span>
                    </div>
                  )}
                </div>
                
                {approvedReviews.length > 0 ? (
                  <>
                    {/* Category Ratings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-1" data-testid="category-cleanliness-avg">
                            {categoryAverages.cleanliness.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600">Cleanliness</div>
                          <div className="flex justify-center mt-2">
                            {renderStars(Math.round(categoryAverages.cleanliness))}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-1" data-testid="category-communication-avg">
                            {categoryAverages.communication.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600">Communication</div>
                          <div className="flex justify-center mt-2">
                            {renderStars(Math.round(categoryAverages.communication))}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-1" data-testid="category-house-rules-avg">
                            {categoryAverages.house_rules.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600">House Rules</div>
                          <div className="flex justify-center mt-2">
                            {renderStars(Math.round(categoryAverages.house_rules))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Featured Reviews - Only Manager-Approved */}
                    <div className="space-y-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Guest Reviews</h3>
                      {approvedReviews.slice(0, 4).map((review) => (
                        <Card key={review.id} className="border-0 shadow-sm hover:shadow-md transition-shadow" data-testid={`review-${review.id}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <Avatar className="h-14 w-14 border-2 border-gray-100">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.guestName}`} />
                                <AvatarFallback className="text-lg font-semibold">
                                  {review.guestName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900" data-testid={`review-guest-${review.id}`}>
                                      {review.guestName}
                                    </h4>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <div className="flex text-yellow-400">
                                        {renderStars(review.rating || 0)}
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {review.channel}
                                      </Badge>
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-500" data-testid={`review-date-${review.id}`}>
                                    {formatDate(review.submittedAt)}
                                  </span>
                                </div>
                                
                                <blockquote className="text-gray-700 leading-relaxed mb-4" data-testid={`review-text-${review.id}`}>
                                  "{review.publicReview}"
                                </blockquote>
                                
                                {/* Category Breakdown */}
                                {review.reviewCategory && review.reviewCategory.length > 0 && (
                                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                                    {review.reviewCategory.map((category) => (
                                      <div key={category.category} className="text-center">
                                        <div className="text-sm font-medium text-gray-600 mb-1 capitalize">
                                          {category.category.replace(/_/g, ' ')}
                                        </div>
                                        <div className="text-lg font-bold text-primary" data-testid={`category-${category.category}-${review.id}`}>
                                          {(category.rating / 2).toFixed(1)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {approvedReviews.length > 4 && (
                        <div className="text-center">
                          <Button
                            variant="outline"
                            size="lg"
                            className="px-8"
                            data-testid="button-show-all-reviews"
                          >
                            Show all {approvedReviews.length} reviews
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Multi-Source Reviews with Google Integration */}
                    {googleReviewsData?.reviews && googleReviewsData.reviews.length > 0 && (
                      <div className="mt-8">
                        <Tabs defaultValue="approved" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="approved">Platform Reviews ({approvedReviews.length})</TabsTrigger>
                            <TabsTrigger value="google" className="flex items-center">
                              <Globe className="h-4 w-4 mr-1" />
                              Google Reviews ({googleReviewsData.reviews.length})
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="approved" className="space-y-6 mt-6">
                            {/* Platform reviews already displayed above */}
                          </TabsContent>
                          
                          <TabsContent value="google" className="space-y-6 mt-6">
                            {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                              <div className="flex items-center space-x-2 text-yellow-800">
                                <Globe className="h-5 w-5" />
                                <span className="font-medium">Google Reviews Integration (Demo)</span>
                              </div>
                              <p className="text-yellow-700 text-sm mt-1">
                                This demonstrates how Google Places API reviews would be integrated and displayed.
                              </p>
                            </div> */}
                            
                            {googleReviewsData.reviews.map((review: any, index: number) => (
                              <Card key={`google-${index}`} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                  <div className="flex items-start space-x-4">
                                    <Avatar className="h-14 w-14 border-2 border-gray-100">
                                      <AvatarImage src={review.googleData?.profile_photo_url} />
                                      <AvatarFallback className="text-lg font-semibold">
                                        {review.guestName.split(' ').map((n: string) => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-3">
                                        <div>
                                          <h4 className="text-lg font-semibold text-gray-900">
                                            {review.guestName}
                                          </h4>
                                          <div className="flex items-center space-x-2 mt-1">
                                            <div className="flex text-yellow-400">
                                              {renderStars(review.rating)}
                                            </div>
                                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                              <Globe className="h-3 w-3 mr-1" />
                                              Google
                                            </Badge>
                                          </div>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                          {review.googleData?.relative_time_description}
                                        </span>
                                      </div>
                                      
                                      <blockquote className="text-gray-700 leading-relaxed">
                                        "{review.publicReview}"
                                      </blockquote>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                    
                    {/* Review Summary Footer */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Consistently rated excellent</h4>
                        <p className="text-gray-600 text-sm">
                          {approvedReviews.length} verified guests have given this property an average rating of {averageRating.toFixed(1)} stars
                          {googleReviewsData?.reviews && (
                            <span> • {googleReviewsData.reviews.length} additional reviews from Google</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-500">
                        <h3 className="text-lg font-medium mb-2">No guest reviews yet</h3>
                        <p>Be the first to review this property and share your experience with future guests.</p>
                        {googleReviewsData?.reviews && googleReviewsData.reviews.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm">However, this property has {googleReviewsData.reviews.length} reviews on Google.</p>
                            <Button variant="outline" className="mt-2">
                              <Globe className="h-4 w-4 mr-2" />
                              View Google Reviews
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
