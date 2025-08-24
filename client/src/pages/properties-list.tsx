import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navigation } from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Eye } from "lucide-react";
import { api } from "@/lib/api";
import type { Property } from "@shared/schema";

export default function PropertiesListPage() {
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => api.getProperties(),
    staleTime: 60000,
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-16 flex items-center justify-center h-64">
          <div className="text-gray-500">Loading properties...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Our Properties</h1>
            <p className="text-gray-600 mt-1">Discover our collection of premium accommodations in London</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: Property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`property-card-${property.id}`}>
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"
                    alt={property.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid={`property-name-${property.id}`}>
                      {property.name}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span data-testid={`property-address-${property.id}`}>{property.address}</span>
                    </div>
                    {property.description && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-3" data-testid={`property-description-${property.id}`}>
                        {property.description.length > 100 
                          ? `${property.description.substring(0, 100)}...` 
                          : property.description
                        }
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {renderStars(property.averageRating || 0)}
                      </div>
                      <span className="text-sm text-gray-600 ml-1" data-testid={`property-rating-${property.id}`}>
                        {property.averageRating ? property.averageRating.toFixed(1) : "New"}
                      </span>
                      {property.reviewCount && property.reviewCount > 0 && (
                        <span className="text-sm text-gray-500" data-testid={`property-review-count-${property.id}`}>
                          ({property.reviewCount} reviews)
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900" data-testid={`property-price-${property.id}`}>
                        £{property.price}
                      </span>
                      <span className="text-gray-600 text-sm">/night</span>
                    </div>
                  </div>

                  <Link href={`/properties/${property.id}`}>
                    <Button 
                      className="w-full bg-primary text-white hover:bg-blue-700"
                      data-testid={`button-view-property-${property.id}`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {properties.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <h3 className="text-lg font-medium mb-2">No properties available</h3>
                <p>Check back soon for new listings!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}